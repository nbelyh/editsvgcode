/**
 * Export public gallery documents (drawing + chat + image blobs) to one
 * self-contained JSON file, ready for gallery-import.cjs.
 *
 * Usage:
 *   node scripts/gallery-export.cjs --source dev  --out gallery.json
 *   node scripts/gallery-export.cjs --source beta --out gallery.json [--id abc --id def]
 *
 * `--source dev` reads the local emulators (start them with `npm run dev`).
 * Blobs are embedded as base64 keyed by content hash, so the file travels on
 * its own — no bucket-to-bucket access needed at either end.
 */
const fs = require('fs');
const { resolveEnv, listDocs, downloadBlob, parseArgs } = require('./gallery-io.cjs');

const CARD_FIELDS = ['text', 'title', 'description', 'views', 'downloads'];

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const sourceName = args.source || 'dev';
  const outPath = args.out || 'gallery.json';
  const onlyIds = args.id ? [].concat(args.id) : null;

  const env = resolveEnv(sourceName);
  console.log(`Exporting from ${env.name} (project ${env.project}, bucket ${env.bucket})`);

  const all = await listDocs(env, 'files');
  const publicDocs = all.filter((d) => {
    if (onlyIds) return onlyIds.includes(d.id);
    return d.fields.visibility === 'public' && d.fields.saved !== false;
  });

  if (publicDocs.length === 0) {
    console.error(onlyIds
      ? 'None of the requested ids exist.'
      : 'Nothing to export: no documents with visibility "public".');
    process.exit(1);
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
