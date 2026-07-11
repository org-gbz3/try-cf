# REST API の実装

## プロジェクトセットアップ

```bash
npm create cloudflare@latest rest-api
```

セットアップの選択肢

```
╭ Create an application with Cloudflare Step 1 of 3
│
├ In which directory do you want to create your application?
│ dir ./rest-api
│
├ What would you like to start with?
│ category Hello World example
│
├ Which template would you like to use?
│ type Worker only
│
├ Which language do you want to use?
│ lang TypeScript
│
├ Copying template files
│ files copied to project directory
│
├ Updating name in `package.json`
│ updated `package.json`
│
├ Installing dependencies
│ installed via `npm install`
│
├ Do you want to add an AGENTS.md file to help AI coding tools understand Cloudflare APIs?
│ yes agents
│
╰ Application created

╭ Configuring your application for Cloudflare Step 2 of 3
│
├ Installing wrangler A command line tool for building Cloudflare Workers
│ installed via `npm install wrangler --save-dev`
│
├ Retrieving current workerd compatibility date
│ compatibility date 2026-07-10
│
├ Generating types for your application
│ generated to `./worker-configuration.d.ts` via `npm run cf-typegen`
│
├ Installing @types/node
│ installed via npm
│
├ You're in an existing git repository. Do you want to use git for version control?
│ yes git
│
╰ Application configured

╭ Deploy with Cloudflare Step 3 of 3
│
├ Do you want to deploy your application?
│ no deploy via `npm run deploy`
│
╰ Done
```

## 必要なライブラリのインストール

```bash
npm install drizzle-orm dotenv
```

> 6 vulnerabilities (1 low, 5 high)
> "@cloudflare/vitest-pool-workers": "^0.12.4" -> 0.18.4 アップグレードが必要（ただし、vitest@^4.1.0 が前提）

```bash
npm install -D drizzle-kit @libsql/client tsx @types/node
```

> 9 vulnerabilities (4 moderate, 5 high)

### ◆脆弱性対応

#### 変更内容（最小限）：

1. rest-api/package.json — vitest: ^4.1.0、@cloudflare/vitest-pool-workers: ^0.18.4 に更新
1. rest-api/vitest.config.mts — defineWorkersConfig（削除された /config サブパス）から defineConfig + cloudflareTest プラグイン方式に書き換え

#### 結果：

- npm test → 2件とも成功
- npm audit → high×5（esbuild/undici/ws/wrangler/miniflare系統）は解消。残るのは moderate×4（drizzle-kit系統）のみで、これは前述の通り正式な修正版が存在しない(RC版のみ)ため今回はスコープ外としています。

test/index.spec.ts や wrangler.jsonc の変更は不要でした。

## Drizzle 設定ファイルの作成

- `rest-api/drizzle.config.ts` を作成

## データベーススキーマの定義

- `rest-api/src/db/schema.ts` を作成

## D1 データベースの作成

- コマンド実行時の質問への回答が、`wrangler.jsonc` に反映される。
- ついでに `name` を `rest-api` から `todo-api` に変えておく。
  > 未デプロイなら名前を変更しても影響ないはず

```bash
npx wrangler d1 create todo-api-db

✔ Would you like Wrangler to add it on your behalf? … yes
✔ What binding name would you like to use? … DB
✔ For local dev, do you want to connect to the remote resource instead of a local resource? … no
```

## 環境変数の型定義

```bash
npx wrangler types
```

## マイグレーションファイルの生成と実行

- `drizzle.config.ts` の `defineConig / out` を `migrations` に変更しておく。

```bash
# マイグレーションファイルを生成
npx drizzle-kit generate

# 開発環境（local）にマイグレーションを適用
npx wrangler d1 migrations apply todo-api-db

# 本番環境にマイグレーションを適用
npx wrangler d1 migrations apply todo-api-db --remote
```

#### 未適用マイグレーションの確認

```bash
$ npx wrangler d1 migrations list todo-api-db

 ⛅️ wrangler 4.110.0
────────────────────
Resource location: local

Use --remote if you want to access the remote instance.

✅ No migrations to apply!
```
