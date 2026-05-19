/**
 * Upload source maps from dist/assets to Azure Blob Storage.
 * Usage: node scripts/upload-sourcemaps.cjs [--account NAME] [--container NAME]
 *
 * Requires: Azure CLI (`az`) logged in.
 * The maps are stored under: sourcemaps/<version>/<filename>.map
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const pkg = require('../package.json');
const version = pkg.version;

// Defaults — override via CLI args or env vars
const account = process.env.SOURCEMAP_STORAGE_ACCOUNT || 'editsvgcodestorage';
const container = process.env.SOURCEMAP_CONTAINER || 'sourcemaps';

const distAssets = path.join(__dirname, '..', 'dist', 'assets');

if (!fs.existsSync(distAssets)) {
  console.error('Error: dist/assets not found. Run the build first.');
  process.exit(1);
}

const mapFiles = fs.readdirSync(distAssets).filter((f) => f.endsWith('.map'));

if (mapFiles.length === 0) {
  console.log('No .map files found in dist/assets.');
  process.exit(0);
}

// Fetch the account key once
const key = execSync(
  `az storage account keys list --account-name ${account} --query "[0].value" -o tsv`,
  { encoding: 'utf8' }
).trim();

// Ensure the container exists
try {
  execSync(
    `az storage container create --name ${container} --account-name ${account} --account-key "${key}"`,
    { stdio: 'pipe' }
  );
} catch {
  // Container may already exist
}

console.log(`Uploading ${mapFiles.length} source map(s) to ${account}/${container}/`);

// Upload all maps in one batch under v<version>/
execSync(
  `az storage blob upload-batch --source "${distAssets}" --destination ${container} --destination-path "v${version}" --account-name ${account} --account-key "${key}" --pattern "*.map" --overwrite`,
  { stdio: 'inherit' }
);

// Also upload under assets/ for direct URL matching
execSync(
  `az storage blob upload-batch --source "${distAssets}" --destination ${container} --destination-path "assets" --account-name ${account} --account-key "${key}" --pattern "*.map" --overwrite`,
  { stdio: 'inherit' }
);

console.log(`\nDone. Source maps uploaded for v${version}.`);
