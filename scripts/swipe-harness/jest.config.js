/**
 * Jest config for the swipe render harness. Extends the widget config but only
 * looks at scripts/swipe-harness.
 */
const base = require('../../jest.config.js')

const { testRegex: _testRegex, ...rest } = base

module.exports = {
  ...rest,
  roots: ['<rootDir>/your-extensions/widgets/agri/scripts/swipe-harness'],
  testMatch: ['**/*.test.tsx']
}
