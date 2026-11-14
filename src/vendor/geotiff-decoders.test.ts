import * as fs from 'fs'
import * as path from 'path'

const SOURCE_FILE = path.join(__dirname, 'geotiff-decoders.ts')
const IMPORT_PATTERN = /from\s+["']([^"']*node_modules\/geotiff\/[^"']+)["']/g

function readImportedPaths (): string[] {
  const source = fs.readFileSync(SOURCE_FILE, 'utf8')
  return Array.from(source.matchAll(IMPORT_PATTERN), (match) => match[1])
}

describe('geotiff-decoders deep imports', () => {
  const importedPaths = readImportedPaths()

  it('imports at least the expected decoder modules', () => {
    expect(importedPaths.length).toBeGreaterThanOrEqual(8)
  })

  it.each(importedPaths)('resolves %s', (specifier) => {
    let resolveError: unknown = null
    try {
      require.resolve(specifier, { paths: [__dirname] })
    } catch (error: unknown) {
      resolveError = error
    }
    if (resolveError !== null) {
      throw new Error(
        `geotiff-decoders.ts imports "${specifier}" but it cannot be resolved. ` +
        'The geotiff package layout may have changed; update the deep import paths.'
      )
    }
  })
})
