#!/usr/bin/env node
// Usage: node check-published-chunks.mjs <distDir> <chunksDir>
// Exits 1 listing chunks referenced by the published build but absent from chunksDir.
import { readdirSync, readFileSync, existsSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

// Prod form: widgets/chunks/<name>.js
const PROD_REF = /widgets\/chunks\/([A-Za-z0-9_.-]+?)\.js/g
// Dev form: "<name>" where name looks like a webpack chunk id.
const DEV_REF = /["']([A-Za-z0-9.-]+(?:_[A-Za-z0-9.-]+)*(?:_(?:js|jsx|ts|tsx)|-[0-9a-f]{6}))["']/g

function listJsFiles (dir) {
  if (!existsSync(dir)) return []
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) return listJsFiles(full)
    return entry.name.endsWith('.js') ? [full] : []
  })
}

function referencesIn (file) {
  const text = readFileSync(file, 'utf8')
  const names = new Set()
  for (const re of [PROD_REF, DEV_REF]) {
    for (const m of text.matchAll(re)) names.add(m[1])
  }
  return names
}

export function findMissingChunks (distDir, chunksDir) {
  const missing = new Set()
  const scanned = new Set()
  const queue = [...listJsFiles(distDir)]
  while (queue.length > 0) {
    const file = queue.pop()
    if (scanned.has(file)) continue
    scanned.add(file)
    for (const name of referencesIn(file)) {
      const chunkFile = join(chunksDir, `${name}.js`)
      if (existsSync(chunkFile)) queue.push(chunkFile)
      else missing.add(name)
    }
  }
  return [...missing].sort()
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [distDir, chunksDir] = process.argv.slice(2)
  if (!distDir || !chunksDir) {
    console.error('Usage: node check-published-chunks.mjs <distDir> <chunksDir>')
    process.exit(2)
  }
  const missing = findMissingChunks(distDir, chunksDir)
  if (missing.length > 0) {
    console.error(`Missing chunks in ${chunksDir}:`)
    for (const name of missing) console.error(`  ${name}`)
    process.exit(1)
  }
  console.log('All referenced chunks are present.')
}
