/**
 * Widget-local Jest config. Reuses the ExB client config but points ts-jest at
 * tsconfig.jest.json: the shared client tsconfig sets ignoreDeprecations "6.0",
 * which the installed TypeScript 5.x rejects (TS5103).
 */
const path = require('path')
const base = require('../../../jest.config.js')

const clientRoot = path.resolve(__dirname, '../../..')
const { 'ts-jest': _legacyTsJest, ...globals } = base.globals || {}

module.exports = {
  ...base,
  rootDir: clientRoot,
  roots: ['<rootDir>/your-extensions/widgets/agri-main/src'],
  globals,
  // Type checking is done by `tsc --noEmit -p tsconfig.jest.json`; ts-jest only
  // transpiles, which keeps each worker well under the default heap limit.
  workerIdleMemoryLimit: '1GB',
  transform: {
    ...base.transform,
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: path.join(__dirname, 'tsconfig.jest.json'), isolatedModules: true }]
  }
}
