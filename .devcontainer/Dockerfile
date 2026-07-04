FROM mcr.microsoft.com/devcontainers/javascript-node:1-22-bookworm

# ── DPI 環境向け CA 証明書 ────────────────────────────────────────────────────
# 組織の CA 証明書 (.crt) を .devcontainer/certs/ に置いてビルドすると
# コンテナの信頼ストアに自動登録される。
# 例: .devcontainer/certs/my-corp-ca.crt
COPY certs/ /tmp/devcontainer-certs/
RUN find /tmp/devcontainer-certs -name "*.crt" -exec cp {} /usr/local/share/ca-certificates/ \; \
    && update-ca-certificates \
    && rm -rf /tmp/devcontainer-certs

# Node.js / npm / wrangler がシステムの CA バンドルを参照するように設定
ENV NODE_EXTRA_CA_CERTS=/etc/ssl/certs/ca-certificates.crt
RUN npm config set cafile /etc/ssl/certs/ca-certificates.crt --global

# 開発用ユーティリティ
RUN apt-get update \
    && apt-get install -y --no-install-recommends ripgrep \
    && rm -rf /var/lib/apt/lists/*