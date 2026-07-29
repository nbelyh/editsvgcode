/**
 * Import a gallery-export.cjs bundle into a project, published under a chosen
 * owner.
 *
 * Usage:
 *   node scripts/gallery-import.cjs --target beta --in gallery.json \
 *     --uid <OWNER_UID> --author "Nikolay Belykh" [--photo https://…] [--dry-run]
 *
 * The owner uid must be a real account in the TARGET project — it decides who
 * can later edit or unpublish these, and where the image blobs live. Find it in
 * Firebase Console → Authentication.
 *
 * Writing goes through the REST API as an administrator, which bypasses
 * security rules — so this validates the gallery field bounds itself. A doc
 * that violates them would be un-editable by its own owner afterwards, since
 * galleryFieldsValid() gates every update in firestore.rules.
 */
const fs = require('fs');
const { resolveEnv, writeDoc, uploadBlob, parseArgs } = require('./gallery-io.cjs');

// Mirrors galleryFieldsValid() in firestore.rules — keep the two in step.
const LIMITS = { title: 200, description: 500, authorName: 120, authorPhoto: 512 };

function validate(entry, authorName, authorPhoto) {
  const problems = [];
  if ((entry.title || '').length > LIMITS.title) problems.push(`title > ${LIMITS.title} chars`);
  if ((entry.description || '').length > LIMITS.description) problems.push(`description > ${LIMITS.description} chars`);
  if (authorName.length > LIMITS.authorName) problems.push(`authorName > ${LIMITS.authorName} chars`);
  if (authorPhoto) {
    if (authorPhoto.length > LIMITS.authorPhoto) problems.push(`authorPhoto > ${LIMITS.authorPhoto} chars`);
    if (!/^https:\/\//.test(authorPhoto)) problems.push('authorPhoto must be https');
  }
  if (!entry.text || !entry.text.includes('<svg')) problems.push('missing or non-SVG text');
  return problems;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const targetName = args.target;
  const inPath = args.in || 'gallery.json';
  const uid = args.uid;
  const authorName = args.author || '';
  const authorPhoto = args.photo || '';
  const dryRun = !!args['dry-run'];

  if (!targetName || !uid) {
    console.error('Required: --target <dev|beta|prod> --uid <OWNER_UID>  (see --help in the header)');
    process.exit(1);
  }

  const bundle = JSON.parse(fs.readFileSync(inPath, 'utf8'));
  if (bundle.version !== 1) throw new Error(`Unsupported bundle version ${bundle.version}`);

  const env = resolveEnv(targetName);
  console.log(`Importing ${bundle.files.length} file(s) into ${env.name} (project ${env.project})`);
  console.log(`  owner uid : ${uid}`);
  console.log(`  author    : ${authorName || '(none)'}`);
  if (dryRun) console.log('  DRY RUN — nothing will be written\n');

  // Validate everything before writing anything: a half-applied import is
  // worse than a refused one.
  let bad = 0;
  for (const entry of bundle.files) {
    const problems = validate(entry, authorName, authorPhoto);
    if (problems.length) { console.error(`  REJECT ${entry.id}: ${problems.join('; ')}`); bad += 1; }
  }
  if (bad) { console.error(`\n${bad} file(s) failed validation — nothing written.`); process.exit(1); }
  if (dryRun) { console.log('Validation passed.'); return; }

  // Blobs first: a message must never reference an object that is not there yet.
  const shaToPath = {};
  for (const [sha, b64] of Object.entries(bundle.blobs || {})) {
    const objectPath = `blobs/${uid}/${sha}`;
    const buf = Buffer.from(b64, 'base64');
    process.stdout.write(`  uploading ${sha.slice(0, 12)}… ${(buf.length / 1024).toFixed(0)} KB `);
    await uploadBlob(env, objectPath, buf);
    shaToPath[sha] = objectPath;
    console.log('ok');
  }

  const now = { __ts: new Date().toISOString() };
  for (const entry of bundle.files) {
    await writeDoc(env, 'files', entry.id, {
      text: entry.text,
      title: entry.title || '',
      description: entry.description || '',
      uid,
      authorName,
      authorPhoto,
      visibility: 'public',
      private: false,          // kept in sync for older readers, as the app does
      saved: true,
      views: 0,
      downloads: 0,
      createdAt: now,
      modified: now,
    });

    for (const m of entry.messages || []) {
      let payload = m.payload;
      // Repoint every blob reference at the new owner's path.
      try {
        const parsed = JSON.parse(payload || '{}');
        let touched = false;
        for (const tc of parsed.toolCalls || []) {
          if (typeof tc.pngRef !== 'string') continue;
          const sha = tc.pngRef.split('/').pop();
          if (shaToPath[sha]) { tc.pngRef = shaToPath[sha]; touched = true; }
        }
        if (touched) payload = JSON.stringify(parsed);
      } catch { /* leave an unparseable payload exactly as it was */ }

      await writeDoc(env, `files/${entry.id}/messages`, String(m.seq).padStart(6, '0'), {
        seq: m.seq, role: m.role, content: m.content || '', payload,
      });
    }
    console.log(`  ${entry.id}  "${entry.title || '(untitled)'}"  ${(entry.messages || []).length} message(s)`);
  }

  console.log(`\nDone. Open the gallery on ${env.name} to check the cards.`);
}

main().catch((err) => { console.error(err.message); process.exit(1); });
