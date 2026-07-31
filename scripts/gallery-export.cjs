/**
 * Export public gallery documents (drawing + chat + image blobs) to one
 * self-contained JSON file, ready for gallery-import.cjs.
 *
 * Usage:
 *   node scripts/gallery-export.cjs --source dev  --out gallery.json
 *   node scripts/gallery-export.cjs --source beta --out gallery.json [--id abc --id def]
 *   node scripts/gallery-export.cjs --source beta --uid <OWNER_UID> --out gallery.json
 *   node scripts/gallery-export.cjs --source beta --owners
 *
 * With no selector only documents already published (visibility "public") are
 * taken. --id picks documents outright and --uid takes everything one account
 * saved, both regardless of current visibility: seeding a gallery means
 * publishing drawings that were never public in the source project. --owners
 * just prints who owns what, to find the uid to pass.
 *
 * `--source dev` reads the local emulators (start them with `npm run dev`).
 * Blobs are embedded as base64 keyed by content hash, so the file travels on
 * its own — no bucket-to-bucket access needed at either end.
 */
const fs = require('fs');
const { resolveEnv, listDocs, downloadBlob, parseArgs, singleArg } = require('./gallery-io.cjs');

const CARD_FIELDS = ['text', 'title', 'description', 'views', 'downloads'];

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const sourceName = singleArg(args, 'source') || 'dev';
  const outPath = singleArg(args, 'out') || 'gallery.json';
  const onlyIds = args.id ? [].concat(args.id) : null;
  const onlyUid = singleArg(args, 'uid') || null;

  const env = resolveEnv(sourceName);
  console.log(`Exporting from ${env.name} (project ${env.project}, bucket ${env.bucket})`);

  const all = await listDocs(env, 'files');

  // Ownership census — the quickest way to find the uid for --uid.
  if (args.owners) {
    const byUid = new Map();
    for (const d of all) {
      const uid = d.fields.uid || '(none)';
      const seen = byUid.get(uid) || { total: 0, saved: 0 };
      seen.total += 1;
      if (d.fields.saved !== false) seen.saved += 1;
      byUid.set(uid, seen);
    }
    console.log('\nuid                                       docs  saved');
    for (const [uid, n] of [...byUid].sort((a, b) => b[1].total - a[1].total)) {
      console.log(`${uid.padEnd(40)} ${String(n.total).padStart(5)} ${String(n.saved).padStart(6)}`);
    }
    return;
  }

  const publicDocs = all.filter((d) => {
    if (onlyIds) return onlyIds.includes(d.id);
    // Drafts are never listable, so they are excluded even when a uid is given.
    if (onlyUid) return d.fields.uid === onlyUid && d.fields.saved !== false;
    return d.fields.visibility === 'public' && d.fields.saved !== false;
  });

  if (publicDocs.length === 0) {
    console.error(onlyIds
      ? 'None of the requested ids exist.'
      : onlyUid
        ? `No saved documents owned by ${onlyUid}.`
        : 'Nothing to export: no documents with visibility "public".');
    process.exit(1);
  }

  // --id/--uid take documents that were never published, so they may carry no
  // gallery meta at all. The import refuses those rather than seeding the
  // gallery with "Untitled" cards the filter can never match, so say it here —
  // before the blob downloads — and let the user fill them in in the JSON.
  const noMeta = publicDocs.filter((d) => !String(d.fields.title || '').trim() || !String(d.fields.description || '').trim());
  if (noMeta.length) {
    console.warn(`\n  ${noMeta.length} of ${publicDocs.length} document(s) have no title and/or description.`);
    console.warn('  Fill those in in the exported JSON — gallery-import.cjs rejects a bundle without them.\n');
  }

  const blobs = {};   // sha filename -> base64
  const files = [];

  for (const doc of publicDocs) {
    const card = {};
    for (const f of CARD_FIELDS) if (doc.fields[f] !== undefined) card[f] = doc.fields[f];

    const messages = (await listDocs(env, `files/${doc.id}/messages`))
      .sort((a, b) => a.fields.seq - b.fields.seq)
      .map((m) => ({ seq: m.fields.seq, role: m.fields.role, content: m.fields.content, payload: m.fields.payload }));

    // Pull every referenced blob in, keyed by its content hash. The uid segment
    // of the stored path is the *source* owner's and is deliberately discarded:
    // the import rewrites it to the target owner.
    for (const m of messages) {
      let payload;
      try { payload = JSON.parse(m.payload || '{}'); } catch { continue; }
      for (const tc of payload.toolCalls || []) {
        if (typeof tc.pngRef !== 'string') continue;
        const sha = tc.pngRef.split('/').pop();
        if (blobs[sha]) continue;
        process.stdout.write(`  fetching blob ${sha.slice(0, 12)}… `);
        const buf = await downloadBlob(env, tc.pngRef);
        blobs[sha] = buf.toString('base64');
        console.log(`${(buf.length / 1024).toFixed(0)} KB`);
      }
    }

    files.push({ id: doc.id, ...card, messages });
    console.log(`  ${doc.id}  "${card.title || '(untitled)'}"  ${messages.length} message(s)`);
  }

  const out = {
    version: 1,
    exportedFrom: env.project,
    files,
    blobs,
  };
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2));
  const mb = (fs.statSync(outPath).size / 1048576).toFixed(2);
  console.log(`\nWrote ${outPath} — ${files.length} file(s), ${Object.keys(blobs).length} blob(s), ${mb} MB`);
}

main().catch((err) => { console.error(err.message); process.exit(1); });
