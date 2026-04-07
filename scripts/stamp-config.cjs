const fs = require('fs');
const p = process.env.GCLOUD_PROJECT;
if (!p) {
  console.error('Error: GCLOUD_PROJECT not set. Use: firebase deploy -P <alias>');
  process.exit(1);
}
const env = p.includes('beta') ? 'beta' : 'prod';
const src = `config/config.${env}.js`;
fs.copyFileSync(src, 'dist/config.js');
console.log(`Stamped dist/config.js from ${src} (project: ${p})`);
