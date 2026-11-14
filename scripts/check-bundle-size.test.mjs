import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { checkBundleSize } from './check-bundle-size.mjs'

const KIB = 1024

function makeDist (widgetKiB, chunkKiB) {
  const root = mkdtempSync(join(tmpdir(), 'bud-'))
  const widgetDir = join(root, 'widgets', 'agri-main')
  mkdirSync(join(widgetDir, 'dist', 'runtime'), { recursive: true })
  mkdirSync(join(root, 'widgets', 'chunks'), { recursive: true })
  const ref = 'x("widgets/chunks/big_chunk.js");'
  writeFileSync(join(widgetDir, 'dist', 'runtime', 'widget.js'), ref + 'a'.repeat(widgetKiB * KIB - ref.length))
  writeFileSync(join(root, 'widgets', 'chunks', 'big_chunk.js'), 'b'.repeat(chunkKiB * KIB))
  return { root, widgetDir }
}

const budget = { widgetJsMaxKiB: 10, chunkMaxKiB: 5 }

test('passes when widget and chunk are within budget', () => {
  const { root, widgetDir } = makeDist(9, 4)
  try {
    const r = checkBundleSize(widgetDir, budget)
    assert.equal(r.ok, true)
    assert.deepEqual(r.errors, [])
  } finally { rmSync(root, { recursive: true, force: true }) }
})

test('fails when widget.js is over budget', () => {
  const { root, widgetDir } = makeDist(11, 4)
  try {
    const r = checkBundleSize(widgetDir, budget)
    assert.equal(r.ok, false)
    assert.match(r.errors[0], /widget\.js/)
  } finally { rmSync(root, { recursive: true, force: true }) }
})

test('fails when a referenced chunk is over budget', () => {
  const { root, widgetDir } = makeDist(9, 6)
  try {
    const r = checkBundleSize(widgetDir, budget)
    assert.equal(r.ok, false)
    assert.match(r.errors[0], /big_chunk\.js/)
  } finally { rmSync(root, { recursive: true, force: true }) }
})

test('fails when widget.js is missing', () => {
  const root = mkdtempSync(join(tmpdir(), 'bud-'))
  try {
    const r = checkBundleSize(join(root, 'widgets', 'agri-main'), budget)
    assert.equal(r.ok, false)
    assert.match(r.errors[0], /Missing/)
  } finally { rmSync(root, { recursive: true, force: true }) }
})
