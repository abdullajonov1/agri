#!/usr/bin/env node
// Usage: node check-bundle-size.mjs <distWidgetDir> [budgetFile]
// <distWidgetDir> is the built widget folder (e.g. dist-prod/widgets/agri-main).
// Checks dist/runtime/widget.js and every chunk it references (widgets/chunks/<name>.js,
// found in <distWidgetDir>/../chunks) against scripts/bundle-budget.json.
// Exits 1 when over budget.
import { existsSync, readFileSync, statSync } from 'node:fs'
import { join, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const BYTES_PER_KIB = 1024
const CHUNK_REF = /widgets\/chunks\/([A-Za-z0-9_.-]+?)\.js/g
const DEFAULT_BUDGET = join(dirname(fileURLToPath(import.meta.url)), 'bundle-budget.json')

const kib = (bytes) => (bytes / BYTES_PER_KIB).toFixed(1)

export function checkBundleSize (distWidgetDir, budget) {
  const widgetFile = join(distWidgetDir, 'dist', 'runtime', 'widget.js')
  if (!existsSync(widgetFile)) return { ok: false, errors: [`Missing ${widgetFile}`] }

  const chunksDir = join(distWidgetDir, '..', 'chunks')
  const errors = []
  const widgetSize = statSync(widgetFile).size
  if (widgetSize > budget.widgetJsMaxKiB * BYTES_PER_KIB) {
    errors.push(`widget.js is ${kib(widgetSize)} KiB, budget ${budget.widgetJsMaxKiB} KiB`)
  }

  const names = new Set(
    [...readFileSync(widgetFile, 'utf8').matchAll(CHUNK_REF)].map((m) => m[1])
  )
  for (const name of [...names].sort()) {
    const chunkFile = join(chunksDir, `${name}.js`)
    if (!existsSync(chunkFile)) {
      errors.push(`Referenced chunk missing: ${name}.js`)
      continue
    }
    const size = statSync(chunkFile).size
    if (size > budget.chunkMaxKiB * BYTES_PER_KIB) {
      errors.push(`chunk ${name}.js is ${kib(size)} KiB, budget ${budget.chunkMaxKiB} KiB`)
    }
  }
  return { ok: errors.length === 0, errors, widgetSize, chunkCount: names.size }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [distWidgetDir, budgetFile = DEFAULT_BUDGET] = process.argv.slice(2)
  if (!distWidgetDir) {
    console.error('Usage: node check-bundle-size.mjs <distWidgetDir> [budgetFile]')
    process.exit(2)
  }
  const budget = JSON.parse(readFileSync(budgetFile, 'utf8'))
  const result = checkBundleSize(distWidgetDir, budget)
  if (!result.ok) {
    console.error('Bundle size budget check FAILED:')
    for (const e of result.errors) console.error(`  ${e}`)
    console.error(`Raise scripts/bundle-budget.json only if the growth is intended.`)
    process.exit(1)
  }
  console.log(`Bundle size OK: widget.js ${kib(result.widgetSize)} KiB, ${result.chunkCount} chunk(s) within budget.`)
}
