#!/usr/bin/env bash
# Point git at the widget's versioned hooks (scripts/git-hooks/).
# Run once per clone: bash scripts/install-hooks.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"

if ! git -C "$ROOT" rev-parse --is-inside-work-tree > /dev/null 2>&1; then
  echo "install-hooks: $ROOT is not inside a git work tree" >&2
  exit 1
fi

git -C "$ROOT" config core.hooksPath scripts/git-hooks
echo "install-hooks: core.hooksPath set to scripts/git-hooks in $ROOT"
