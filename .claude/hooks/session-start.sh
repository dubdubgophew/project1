#!/bin/bash
set -euo pipefail

# Only run in remote (web) sessions
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "$CLAUDE_PROJECT_DIR"

echo "[session-start] Installing npm dependencies..."
npm install --prefer-offline --no-audit --no-fund

# Install missing test type definitions so tsc --noEmit passes cleanly
if ! [ -d node_modules/@types/jest ]; then
  echo "[session-start] Installing @types/jest for type-check..."
  npm install --save-dev @types/jest --no-audit --no-fund
fi

echo "[session-start] Done."
