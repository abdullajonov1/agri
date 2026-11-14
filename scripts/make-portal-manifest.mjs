// Builds the Portal package manifest from the widget's manifest.json.
// CLI: node scripts/make-portal-manifest.mjs <manifest.json> <builtAt> <pagesUrl>
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

export const PORTAL_WIDGET_NAME = 'Agro_widgetV6'
const SOURCE_URL = 'https://github.com/abdullajonov1/agri'

export function makePortalManifest (manifest, { version, builtAt, pagesUrl }) {
  return {
    ...manifest,
    name: PORTAL_WIDGET_NAME,
    label: `Space Agro Monitoring V${version}`,
    description: `Agri portal package ${version} (built ${builtAt}). Stable URL: ${pagesUrl}. Source: ${SOURCE_URL}`
  }
}

function main (argv) {
  const [manifestPath, builtAt, pagesUrl] = argv
  if (!manifestPath || !builtAt || !pagesUrl) {
    console.error('Usage: node make-portal-manifest.mjs <manifest.json> <builtAt> <pagesUrl>')
    process.exit(1)
  }
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
  const out = makePortalManifest(manifest, { version: manifest.version, builtAt, pagesUrl })
  process.stdout.write(JSON.stringify(out, null, 2) + '\n')
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main(process.argv.slice(2))
