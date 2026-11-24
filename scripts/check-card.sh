#!/usr/bin/env bash
# Proof command for one plan card.
# Usage: bash scripts/check-card.sh "<jest path pattern>" <file> [file...]
#   - runs the matching jest suites (widget-local config)
#   - fails if tsc reports an error in any of the given files
#   - runs eslint on the given files
#   - fails on `any` in the given files
set -euo pipefail
WIDGET="$(cd "$(dirname "$0")/.." && pwd)"
CLIENT="$(cd "$WIDGET/../../.." && pwd)"
PATTERN="$1"; shift
FILES=("$@")
REL=()
for f in "${FILES[@]}"; do REL+=("your-extensions/widgets/agri/${f#your-extensions/widgets/agri/}"); done
cd "$CLIENT"

echo "[check] jest: $PATTERN"
npx jest -c your-extensions/widgets/agri/jest.config.js "$PATTERN"

echo "[check] tsc (errors in touched files only)"
TSC_OUT="$(npx tsc -p your-extensions/widgets/agri/tsconfig.check.json 2>&1 || true)"
FAIL=0
for f in "${REL[@]}"; do
  if [ -f "$f" ] && printf '%s\n' "$TSC_OUT" | grep -F "$f" | grep -q "error TS"; then
    printf '%s\n' "$TSC_OUT" | grep -F "$f"; FAIL=1
  fi
done
[ "$FAIL" -eq 0 ] || { echo "[check] tsc errors"; exit 1; }

CODE=()
for f in "${REL[@]}"; do case "$f" in *.ts|*.tsx) [ -f "$f" ] && CODE+=("$f");; esac; done
if [ "${#CODE[@]}" -gt 0 ]; then
  echo "[check] eslint"
  npx eslint "${CODE[@]}"
  echo "[check] no any"
  if grep -nE ':\s*any\b|as any\b|<any>' "${CODE[@]}"; then echo "[check] 'any' found"; exit 1; fi
fi
echo "[check] OK"
