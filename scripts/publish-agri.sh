#!/usr/bin/env bash
# Publish Agro_widgetV6 (built) to abdullajonov1/agri GitHub Pages.
# Portal URL (stable — same after every publish):
#   https://abdullajonov1.github.io/agri/widgets/Agro_widgetV6/manifest.json
#
# EXB portal needs BOTH:
#   widgets/Agro_widgetV6/...
#   widgets/chunks/...
#
# After code changes:
#   1) npm start / build so client/dist/... is fresh
#   2) bash scripts/publish-agri.sh
#   3) Portal → Custom widgets → Agro_widgetV6 → Update
#      (Pages updates immediately; Portal caches until Update)
#
# Usage:
#   bash scripts/publish-agri.sh

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
# agri-main -> widgets -> your-extensions -> client
EXB_CLIENT="$(cd "$ROOT/../../.." && pwd)"
WIDGET_NAME="$(basename "$ROOT")"
DIST_SRC="$EXB_CLIENT/dist/widgets/$WIDGET_NAME"
PROD_SRC="$EXB_CLIENT/dist-prod/widgets/$WIDGET_NAME"
CHUNKS_SRC="$EXB_CLIENT/dist/widgets/chunks"
PROD_CHUNKS="$EXB_CLIENT/dist-prod/widgets/chunks"
WORK="${TMPDIR:-/tmp}/agri-publish-$$"
REPO="abdullajonov1/agri"
PAGES_URL="https://abdullajonov1.github.io/agri/widgets/Agro_widgetV6/manifest.json"
VERSION="$(cd "$ROOT" && node -p "JSON.parse(require('fs').readFileSync('manifest.json','utf8')).version")"
VERSION="${VERSION:-6.1.2}"

SRC=""
CHUNKS=""
if [ -d "$PROD_SRC/dist" ]; then
  SRC="$PROD_SRC"
elif [ -d "$DIST_SRC/dist" ]; then
  SRC="$DIST_SRC"
else
  echo "No built widget found. Run EXB client (npm start) or build:prod first."
  exit 1
fi
if [ -d "$PROD_CHUNKS" ]; then
  CHUNKS="$PROD_CHUNKS"
elif [ -d "$CHUNKS_SRC" ]; then
  CHUNKS="$CHUNKS_SRC"
else
  echo "No widgets/chunks folder found — portal will fail import()."
  exit 1
fi

echo "Using build:   $SRC"
echo "Using chunks:  $CHUNKS"
echo "Version:       $VERSION"

rm -rf "$WORK"
gh repo clone "$REPO" "$WORK" -- --depth 1

# Keep source on main for clone/dev; refresh portal package + source tree.
rm -rf "$WORK/widgets" "$WORK/src" "$WORK/scripts"
mkdir -p "$WORK/widgets/Agro_widgetV6" "$WORK/widgets/chunks"
cp -r "$SRC/dist" "$WORK/widgets/Agro_widgetV6/"
cp "$ROOT/config.json" "$WORK/widgets/Agro_widgetV6/config.json"
cp "$ROOT/icon.svg" "$WORK/widgets/Agro_widgetV6/icon.svg"
# dist/widgets/chunks is shared by every widget built on this machine. Copy
# only the chunks this widget references (directly or via another copied
# chunk) so other projects' code is never published.
needed_chunks() {
  local scan_dirs=("$SRC/dist")
  local found=1
  : > "$WORK/.chunks"
  while [ "$found" -eq 1 ]; do
    found=0
    for f in "$CHUNKS"/*.js; do
      name="$(basename "$f" .js)"
      grep -qxF "$name" "$WORK/.chunks" && continue
      if grep -rqF "\"$name\"" "${scan_dirs[@]}" "$WORK/widgets/chunks" 2>/dev/null; then
        echo "$name" >> "$WORK/.chunks"
        cp "$f" "$WORK/widgets/chunks/"
        found=1
      fi
    done
  done
}
needed_chunks
echo "Chunks copied: $(wc -l < "$WORK/.chunks")"
rm -f "$WORK/.chunks"

# Mirror ExB widget source so the agri repo stays a usable clone target.
cp -r "$ROOT/src" "$WORK/src"
cp -r "$ROOT/scripts" "$WORK/scripts"
cp "$ROOT/manifest.json" "$WORK/manifest.json"
cp "$ROOT/config.json" "$WORK/config.json"
cp "$ROOT/icon.svg" "$WORK/icon.svg"
if [ -f "$ROOT/setting.tsx" ]; then cp "$ROOT/setting.tsx" "$WORK/setting.tsx"; fi
if [ -f "$ROOT/runtime/widget.tsx" ]; then
  mkdir -p "$WORK/runtime"
  # Prefer full runtime/ if present in widget root layout.
  :
fi
# Copy common root widget entry files when present.
for f in setting.tsx setting.tsx.bak code.ts; do
  [ -f "$ROOT/$f" ] && cp "$ROOT/$f" "$WORK/$f" || true
done
if [ -d "$ROOT/runtime" ]; then cp -r "$ROOT/runtime" "$WORK/runtime"; fi
if [ -d "$ROOT/setting" ]; then cp -r "$ROOT/setting" "$WORK/setting"; fi
if [ -d "$ROOT/dist" ]; then cp -r "$ROOT/dist" "$WORK/dist"; fi
if [ -f "$ROOT/package.json" ]; then cp "$ROOT/package.json" "$WORK/package.json"; fi
if [ -f "$ROOT/tsconfig.json" ]; then cp "$ROOT/tsconfig.json" "$WORK/tsconfig.json"; fi
if [ -f "$ROOT/.gitignore" ]; then cp "$ROOT/.gitignore" "$WORK/.gitignore"; fi

cat > "$WORK/widgets/Agro_widgetV6/manifest.json" <<EOF
{
  "name": "Agro_widgetV6",
  "label": "Space Agro Monitoring V6",
  "type": "widget",
  "version": "$VERSION",
  "exbVersion": "1.16.0",
  "author": "abdullajonov1",
  "description": "Agri portal package (single-date export-image, eager Graff+Popup). Source: https://github.com/abdullajonov1/agri",
  "copyright": "",
  "license": "",
  "properties": {
    "supportAutoSize": false
  },
  "translatedLocales": [
    "en",
    "uz",
    "ru"
  ],
  "defaultSize": {
    "width": 1920,
    "height": 920
  },
  "supports": {
    "map": true
  },
  "dependency": [
    "jimu-arcgis"
  ],
  "supportInlineEditing": true,
  "hasSettingPage": true,
  "useDataSources": true
}
EOF

# Pages from repo root
touch "$WORK/.nojekyll"

# README for portal users (kept in sync with the source README)
cp "$ROOT/README.md" "$WORK/README.md"

cd "$WORK"
# Source .gitignore ignores "dist/" — force-add the portal package tree.
git add -A
git add -f widgets/
if git diff --cached --quiet; then
  echo "No changes to publish."
  exit 0
fi
MSG="Publish Agro_widgetV6 $VERSION ($(date -u +%Y-%m-%dT%H:%MZ))"
git -c user.email="abdullajonov1@users.noreply.github.com" -c user.name="abdullajonov1" commit -m "$MSG"
git push origin HEAD

# Ensure GitHub Pages is on (main / root)
gh api -X POST "repos/$REPO/pages" -f build_type=legacy -f source[branch]=main -f source[path]=/ 2>/dev/null \
  || gh api -X PUT "repos/$REPO/pages" -f build_type=legacy -f source[branch]=main -f source[path]=/ 2>/dev/null \
  || true

echo ""
echo "Published. Portal manifest URL:"
echo "  $PAGES_URL"
echo "GitHub Pages may take 1–2 minutes. Then Update Agro_widgetV6 in Portal."
