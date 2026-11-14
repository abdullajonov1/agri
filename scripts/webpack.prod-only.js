// Production build of this widget only, for scripts/publish-agri.sh.
//
// `npm run build:prod` compiles every your-extensions widget, and production
// webpack emits nothing when any of them fails (evapo, Agri-mainV15 do), so
// this keeps only this widget's entries of the standard ExB extensions config.
//
// Run from client/:
//   NODE_ENV=production OUTPUT_FOLDER=./dist-prod npx webpack --mode production \
//     --config your-extensions/widgets/agri-main/scripts/webpack.prod-only.js
const fs = require("fs");
const path = require("path");

const WIDGET = path.basename(path.resolve(__dirname, ".."));
const CLIENT = (() => {
  for (let dir = __dirname; ; dir = path.dirname(dir)) {
    if (fs.existsSync(path.join(dir, "webpack/webpack-extensions.config.js"))) return dir;
    if (path.dirname(dir) === dir) throw new Error(`Cannot find client/ (webpack/webpack-extensions.config.js) above ${__dirname}`);
  }
})();
const configs = require(path.join(CLIENT, "webpack/webpack-extensions.config.js"));

module.exports = configs
  .filter((config) => config.name === "widgets")
  .map((config) => {
    const entry = {};
    for (const [key, value] of Object.entries(config.entry)) {
      if (key.includes(`/${WIDGET}/`)) entry[key] = value;
    }
    if (!Object.keys(entry).length) throw new Error(`No webpack entries for ${WIDGET}`);
    return { ...config, entry };
  });
