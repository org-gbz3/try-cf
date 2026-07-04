# try-cf

## workers

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
