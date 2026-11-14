#!/usr/bin/env bash
# One command: production build of this widget + publish to the stable URL
#   https://abdullajonov1.github.io/agri/widgets/Agro_widgetV6/manifest.json
#
# Usage (from the widget folder):
#   bash scripts/release-agri.sh            # keep manifest version
#   bash scripts/release-agri.sh patch      # 6.3.3 -> 6.3.4, then build + publish
#   bash scripts/release-agri.sh 6.4.0      # set an exact version
#
# The portal item keeps pointing at the same URL, so it never needs to be
# re-registered. After publish: Portal -> Custom widgets -> Agro_widgetV6 ->
# Update (or wait for the browser / Pages cache, ~10 min) to load the new code.

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CLIENT="$(cd "$ROOT/../../.." && pwd)"
BUMP="${1:-}"

if [ -n "$BUMP" ]; then
  (cd "$ROOT" && node -e '
const fs = require("fs");
const arg = process.argv[1];
const m = JSON.parse(fs.readFileSync("manifest.json", "utf8"));
let v = m.version;
if (arg === "patch" || arg === "minor" || arg === "major") {
  const p = v.split(".").map(Number);
  if (arg === "major") { p[0]++; p[1] = 0; p[2] = 0; }
  else if (arg === "minor") { p[1]++; p[2] = 0; }
  else { p[2]++; }
  v = p.join(".");
} else if (/^\d+\.\d+\.\d+$/.test(arg)) {
  v = arg;
} else {
  console.error("Unknown version argument: " + arg);
  process.exit(1);
}
m.version = v;
m.label = m.label.replace(/V\d+\.\d+\.\d+/, "V" + v);
fs.writeFileSync("manifest.json", JSON.stringify(m, null, 2) + "\n");
console.log("Version -> " + v);
' "$BUMP")
fi

echo "Building production bundle..."
(cd "$CLIENT" && NODE_ENV=production OUTPUT_FOLDER=./dist-prod npx webpack --mode production \
  --config "your-extensions/widgets/$(basename "$ROOT")/scripts/webpack.prod-only.js")

bash "$ROOT/scripts/publish-agri.sh"
