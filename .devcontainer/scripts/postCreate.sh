#!/usr/bin/env bash
set -euo pipefail

# npm のユーザースコープでも CA バンドルを参照
npm config set cafile /etc/ssl/certs/ca-certificates.crt

# package.json があれば依存パッケージをインストールし、型定義を生成
if [[ -f package.json ]]; then
  npm ci
  # worker-configuration.d.ts は gitignore 対象のため clone 後に再生成
  if [[ -f wrangler.jsonc || -f wrangler.toml ]]; then
    npx wrangler types
  fi
fi