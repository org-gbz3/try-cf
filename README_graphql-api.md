# GraphQL API の実装

## プロジェクトセットアップ

```bash
npm create cloudflare@latest graphql-api
```

セットアップの選択肢

```
╭ Create an application with Cloudflare Step 1 of 3
│
├ In which directory do you want to create your application?
│ dir ./graphql-api
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
│ compatibility date 2026-07-12
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

## Hyperdrive を使用したデータベースの接続

- APIトークンに `Developer Platform` > `Hyperdrive: Edit` を追加

```bash
npx wrangler hyperdrive create supabase --connection-string="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-ID].supabase.co:5432/postgres" --caching-disabled --origin-connection-limit 10

# wrangler.jsonc を更新
# 型定義を生成
cd graphql-api
npx wrangler types
```

## ライブラリインストール

```bash
npm install drizzle-orm postgres dotenv
npm install -D drizzle-kit dotenv-cli
```

> 9 vulnerabilities (4 moderate, 5 high)
> "@cloudflare/vitest-pool-workers": "^0.12.4" -> 0.18.4 アップグレードが必要（ただし、vitest@^4.1.0 が前提）

`package.json` 更新後、 `npm install` すると以下。

> 4 moderate severity vulnerabilities

## マイグレーションファイルを生成

```bash
# マイグレーションファイルを生成
npx drizzle-kit generate

# 開発環境（local）にマイグレーションを適用
npm run db:migrate:dev
```

```bash
$ psql "$(grep -m1 '^DATABASE_URL=' .env.development | cut -d= -f2-)" -c '\dt'
          List of relations
 Schema |   Name   | Type  |  Owner
--------+----------+-------+----------
 public | articles | table | postgres
(1 row)
```

## マイグレーション運用手順

### テーブル一覧を確認する

```bash
psql "$(grep -m1 '^DATABASE_URL=' .env.development | cut -d= -f2-)" -c '\dt'
```

### 未適用マイグレーションの有無を確認する

drizzle-kit は適用済みマイグレーションを `drizzle.__drizzle_migrations` テーブルに記録する。ローカルの `migrations/meta/_journal.json` の件数と DB 上の件数を比較すれば、未適用の有無がわかる（DBに副作用なし）。

```bash
local_count=$(jq '.entries | length' migrations/meta/_journal.json)
db_count=$(psql "$(grep -m1 '^DATABASE_URL=' .env.development | cut -d= -f2-)" -tAc 'select count(*) from drizzle.__drizzle_migrations;')
echo "local=$local_count db=$db_count"
[ "$local_count" = "$db_count" ] && echo "未適用なし" || echo "未適用あり"
```

### マイグレーションを適用する

`db:migrate:dev` は冪等なので、未適用があれば適用し、なければ何もしない。

```bash
npm run db:migrate:dev
```

### スキーマ変更時の流れ

1. `src/db/schema.ts` を編集
2. `npx drizzle-kit generate` でマイグレーションファイルを生成
3. `npm run db:migrate:dev` で開発環境（local）に適用
4. 本番適用時は `npm run db:migrate:prod`（`.env.development` を経由しないため、環境変数 `DATABASE_URL` に本番接続文字列が必要）
