# try-cf

## workers

- [Get Started](https://developers.cloudflare.com/workers/static-assets/get-started/)

### my-static-site

#### 初期セットアップ

```bash
$ npm create cloudflare@latest -- my-static-site
...
╭ Create an application with Cloudflare Step 1 of 3
│
├ In which directory do you want to create your application?
│ dir ./my-static-site
│
├ What would you like to start with?
│ category Hello World example
│
├ Which template would you like to use?
│ type Static site
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
│ compatibility date 2026-07-04
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
...
$
```

#### デプロイ

```bash
$ cd my-static-site/
$ npm run deploy
$
```

### my-dynamic-site

#### 初期セットアップ

```bash
$ npm create cloudflare@latest -- my-dynamic-site
...
╭ Create an application with Cloudflare Step 1 of 3
│
├ In which directory do you want to create your application?
│ dir ./my-dynamic-site
│
├ What would you like to start with?
│ category Hello World example
│
├ Which template would you like to use?
│ type SSR / full-stack app
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
│ compatibility date 2026-07-04
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
...
$
```

#### デプロイ

```bash
$ cd my-dynamic-site/
$ npm run deploy
```

#### アクセス制限

1. ダッシュボードで `Zero Trust` > `Access コントロール` > `アプリケーション`
1. 新規アプリケーションを作成
   > - 宛先: my-dynamic-site.<domain-name>
   > - Accessポリシー: Emails

### edge-blog-db

#### D1 データベースの作成

- トークンに `Developer Platform` > `D1: Edit` を追加。
- トークンに `Account & Billing` > `Account Settings: Read` を追加。

```bash
npx wrangler d1 create edge-blog-db
npx wrangler types
```

#### 初期マイグレーションファイルの作成

```bash
npx wrangler d1 migrations create edge-blog-db init
```

#### マイグレーションの適用

- `my-dynamic-site/migrations/0001_init.sql` を編集

```bash
# ローカル環境
npx wrangler d1 migrations apply edge-blog-db

# 本番環境
npx wrangler d1 migrations apply edge-blog-db --remote
```

#### 初期データの投入実行

- `my-dynamic-site/seed.sql` に初期データ登録用の SQL を書く。

```bash
# ローカル環境
npx wrangler d1 execute edge-blog-db --file=./seed.sql

# 本番環境
npx wrangler d1 execute edge-blog-db --file=./seed.sql --remote
```

#### データベースの動作確認

```bash
# 記事一覧の確認
npx wrangler d1 execute edge-blog-db --command="SELECT * FROM articles;"

# カテゴリと記事の関連確認
npx wrangler d1 execute edge-blog-db --command="
SELECT
  a.title,
  c.name as category_name
FROM articles a
JOIN article_categories ac ON a.id = ac.article_id
JOIN categories c ON ac.category_id = c.id
ORDER BY a.created_at DESC;
"
```

#### 追加マイグレーションの作成

```bash
npx wrangler d1 migrations create edge-blog-db add_tags
```

#### 未適用マイグレーションの確認

```bash
$ npx wrangler d1 migrations list edge-blog-db

 ⛅️ wrangler 4.107.0 (update available 4.110.0)
───────────────────────────────────────────────
Resource location: local

Use --remote if you want to access the remote instance.

Migrations to be applied:
┌───────────────────┐
│ Name              │
├───────────────────┤
│ 0002_add_tags.sql │
└───────────────────┘
$ npx wrangler d1 migrations apply edge-blog-db
...
🚣 4 commands executed successfully.
┌───────────────────┬────────┐
│ name              │ status │
├───────────────────┼────────┤
│ 0002_add_tags.sql │ ✅     │
└───────────────────┴────────┘
$ npx wrangler d1 migrations list edge-blog-db

 ⛅️ wrangler 4.107.0 (update available 4.110.0)
───────────────────────────────────────────────
Resource location: local

Use --remote if you want to access the remote instance.

✅ No migrations to apply!
$
```

---

```
  "d1_databases": [
    {
      "binding": "edge_blog_db",
      "database_name": "edge-blog-db",
      "database_id": "3e0f3498-d7fb-4dae-906a-39a4351760e9"
    }
  ]

→ npx wrangler types
```
