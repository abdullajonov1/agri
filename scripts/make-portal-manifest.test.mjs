import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { makePortalManifest } from './make-portal-manifest.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const manifestPath = join(here, '..', 'manifest.json')
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
const builtAt = '2026-11-14T10:00Z'
const pagesUrl = 'https://abdullajonov1.github.io/agri/widgets/Agro_widgetV6/manifest.json'

// What the old heredoc in publish-agri.sh produced.
function legacyHeredoc (version) {
  return {
    name: 'Agro_widgetV6',
    label: `Space Agro Monitoring V${version}`,
    type: 'widget',
    version,
    exbVersion: '1.16.0',
    author: 'abdullajonov1',
    description: `Agri portal package ${version} (built ${builtAt}). Stable URL: ${pagesUrl}. Source: https://github.com/abdullajonov1/agri`,
    copyright: '',
    license: '',
    properties: { supportAutoSize: false },
    translatedLocales: ['en', 'uz', 'ru'],
    defaultSize: { width: 1920, height: 920 },
    supports: { map: true },
    dependency: ['jimu-arcgis'],
    supportInlineEditing: true,
    hasSettingPage: true,
    useDataSources: true
  }
}

test('matches the legacy heredoc output for the current manifest', () => {
  const out = makePortalManifest(manifest, { version: manifest.version, builtAt, pagesUrl })
  assert.deepEqual(out, legacyHeredoc(manifest.version))
  assert.deepEqual(Object.keys(out), Object.keys(legacyHeredoc(manifest.version)))
})

test('overrides name, label and description only', () => {
  const out = makePortalManifest({ ...manifest, extra: 1 }, { version: '9.9.9', builtAt, pagesUrl })
  assert.equal(out.name, 'Agro_widgetV6')
  assert.equal(out.label, 'Space Agro Monitoring V9.9.9')
  assert.equal(out.extra, 1)
  assert.equal(out.version, manifest.version)
})

test('does not mutate the input manifest', () => {
  const copy = structuredClone(manifest)
  makePortalManifest(manifest, { version: manifest.version, builtAt, pagesUrl })
  assert.deepEqual(manifest, copy)
})

test('CLI prints the same JSON', () => {
  const stdout = execFileSync('node', [join(here, 'make-portal-manifest.mjs'), manifestPath, builtAt, pagesUrl], { encoding: 'utf8' })
  assert.deepEqual(JSON.parse(stdout), legacyHeredoc(manifest.version))
})
