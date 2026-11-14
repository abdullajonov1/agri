import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { findMissingChunks } from './check-published-chunks.mjs'

function setup (distFiles, chunkFiles) {
  const root = mkdtempSync(join(tmpdir(), 'chunkcheck-'))
  const dist = join(root, 'dist')
  const chunks = join(root, 'chunks')
  mkdirSync(join(dist, 'runtime'), { recursive: true })
  mkdirSync(chunks)
  for (const [n, c] of Object.entries(distFiles)) writeFileSync(join(dist, 'runtime', n), c)
  for (const [n, c] of Object.entries(chunkFiles)) writeFileSync(join(chunks, n), c)
  return { root, dist, chunks }
}

test('returns empty when every prod-form reference exists', () => {
  const { root, dist, chunks } = setup(
    { 'widget.js': 'import("widgets/chunks/agri-main_src_a_js.js")' },
    { 'agri-main_src_a_js.js': '' })
  assert.deepEqual(findMissingChunks(dist, chunks), [])
  rmSync(root, { recursive: true })
})

test('reports a missing prod-form chunk', () => {
  const { root, dist, chunks } = setup(
    { 'widget.js': 'x("widgets/chunks/agri-main_src_b_js.js")' }, {})
  assert.deepEqual(findMissingChunks(dist, chunks), ['agri-main_src_b_js'])
  rmSync(root, { recursive: true })
})

test('reports a missing dev-form chunk', () => {
  const { root, dist, chunks } = setup(
    { 'widget.js': 'load("common_access-viloyat_ts")' }, {})
  assert.deepEqual(findMissingChunks(dist, chunks), ['common_access-viloyat_ts'])
  rmSync(root, { recursive: true })
})

test('scans referenced chunks transitively', () => {
  const { root, dist, chunks } = setup(
    { 'widget.js': 'x("widgets/chunks/one_js.js")' },
    { 'one_js.js': 'y("widgets/chunks/two_js.js")' })
  assert.deepEqual(findMissingChunks(dist, chunks), ['two_js'])
  rmSync(root, { recursive: true })
})
