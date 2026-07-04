/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.jsonc`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

const uploadPageHtml = `<!doctype html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>PDF Upload</title>
    <style>
      :root { color-scheme: light; }
      body {
        margin: 0;
        font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif;
        background: #f5f7fb;
        color: #162033;
      }
      .wrap {
        max-width: 760px;
        margin: 40px auto;
        padding: 0 16px;
      }
      .card {
        background: #fff;
        border-radius: 14px;
        padding: 20px;
        box-shadow: 0 8px 24px rgba(12, 35, 64, 0.08);
      }
      h1 { margin-top: 0; font-size: 1.4rem; }
      .hint { color: #4c5b79; font-size: 0.92rem; margin-bottom: 14px; }
      label { display: block; margin: 12px 0 6px; font-weight: 600; }
      input[type="text"], input[type="file"] {
        width: 100%;
        box-sizing: border-box;
        padding: 10px;
        border: 1px solid #d2daea;
        border-radius: 8px;
        background: #fff;
      }
      button {
        margin-top: 14px;
        border: 0;
        border-radius: 8px;
        padding: 10px 16px;
        background: #1366d6;
        color: #fff;
        font-weight: 700;
        cursor: pointer;
      }
      pre {
        white-space: pre-wrap;
        background: #0f172a;
        color: #d8e3ff;
        border-radius: 8px;
        padding: 12px;
        margin-top: 14px;
      }
      code { background: #eef3ff; padding: 2px 6px; border-radius: 6px; }
    </style>
  </head>
  <body>
    <div class="wrap">
      <div class="card">
        <h1>R2 PDF Upload</h1>
        <p class="hint">
          access path には公開 URL の <code>/pdfs/</code> 以降を入力します。<br />
          例: <code>docs/2026/design-magazine.pdf</code>
        </p>

        <form id="uploadForm">
          <label for="pdf">PDF file</label>
          <input id="pdf" name="pdf" type="file" accept="application/pdf,.pdf" required />

          <label for="accessPath">Access path (optional)</label>
          <input
            id="accessPath"
            name="accessPath"
            type="text"
            placeholder="docs/2026/design-magazine.pdf"
          />

          <button type="submit">Upload</button>
        </form>

        <pre id="result" hidden></pre>
      </div>
    </div>

    <script>
      const form = document.getElementById('uploadForm');
      const result = document.getElementById('result');

      form.addEventListener('submit', async (event) => {
        event.preventDefault();
        result.hidden = false;
        result.textContent = 'Uploading...';

        try {
          const body = new FormData(form);
          const res = await fetch('/upload', { method: 'POST', body });
          const text = await res.text();

          try {
            const json = JSON.parse(text);
            result.textContent = JSON.stringify(json, null, 2);
          } catch {
            result.textContent = text;
          }
        } catch (err) {
          result.textContent = String(err);
        }
      });
    </script>
  </body>
</html>`;

function escapeHtml(value: string): string {
	return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
}

type PdfEntry = {
	path: string;
	size: number;
	updatedAt: Date;
};

function formatSize(bytes: number): string {
	if (bytes < 1024) {
		return `${bytes} B`;
	}

	const units = ['KB', 'MB', 'GB', 'TB'];
	let value = bytes;
	let unitIndex = -1;
	while (value >= 1024 && unitIndex < units.length - 1) {
		value /= 1024;
		unitIndex += 1;
	}

	return `${value.toFixed(value >= 100 ? 0 : 1)} ${units[unitIndex]}`;
}

function listPageHtml(entries: PdfEntry[]): string {
	const rows = entries
		.map((entry) => {
			const href = `/pdfs/${encodePath(entry.path)}`;
			const updatedIso = entry.updatedAt.toISOString();
			const updatedText = escapeHtml(entry.updatedAt.toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo', hour12: false }));
			const sizeText = escapeHtml(formatSize(entry.size));

			return `<tr>
            <td><a href="${href}" target="_blank" rel="noopener noreferrer">${escapeHtml(entry.path)}</a></td>
            <td><time datetime="${updatedIso}">${updatedText}</time></td>
            <td class="num">${sizeText}</td>
          </tr>`;
		})
		.join('');

	const tableBody =
		rows ||
		`<tr>
          <td colspan="3">PDF がまだありません</td>
        </tr>`;

	return `<!doctype html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>PDF List</title>
    <style>
      :root { color-scheme: light; }
      body {
        margin: 0;
        font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif;
        background: #f5f7fb;
        color: #162033;
      }
      .wrap {
        max-width: 900px;
        margin: 40px auto;
        padding: 0 16px;
      }
      .card {
        background: #fff;
        border-radius: 14px;
        padding: 20px;
        box-shadow: 0 8px 24px rgba(12, 35, 64, 0.08);
      }
      h1 { margin-top: 0; font-size: 1.4rem; }
      .actions { margin-bottom: 16px; }
      .actions a {
        display: inline-block;
        text-decoration: none;
        border-radius: 8px;
        padding: 8px 12px;
        background: #1366d6;
        color: #fff;
        font-weight: 700;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        background: #fff;
      }
      th, td {
        border-bottom: 1px solid #e1e8f5;
        text-align: left;
        padding: 10px 8px;
        vertical-align: top;
      }
      th {
        font-size: 0.88rem;
        color: #4c5b79;
      }
      td.num {
        white-space: nowrap;
      }
      a { color: #13449b; }
      code { background: #eef3ff; padding: 2px 6px; border-radius: 6px; }
    </style>
  </head>
  <body>
    <div class="wrap">
      <div class="card">
        <h1>R2 PDF List</h1>
        <div class="actions"><a href="/upload">Upload PDF</a></div>
        <p><code>/pdfs/</code> 以下のパス名を昇順で表示しています。</p>
        <table>
          <thead>
            <tr>
              <th>Path</th>
              <th>最終更新日時</th>
              <th>サイズ</th>
            </tr>
          </thead>
          <tbody>
            ${tableBody}
          </tbody>
        </table>
      </div>
    </div>
  </body>
</html>`;
}

function badRequest(message: string): Response {
	return Response.json({ ok: false, error: message }, { status: 400 });
}

function encodePath(path: string): string {
	return path
		.split('/')
		.filter(Boolean)
		.map((segment) => encodeURIComponent(segment))
		.join('/');
}

function normalizeAccessPath(rawPath: string, fallbackName: string): string | null {
	const candidate = (rawPath.trim() || fallbackName).replaceAll('\\', '/').replace(/^\/+/, '');
	if (!candidate) {
		return null;
	}

	if (candidate.includes('..') || candidate.includes('?') || candidate.includes('#')) {
		return null;
	}

	if (!candidate.toLowerCase().endsWith('.pdf')) {
		return null;
	}

	return candidate;
}

async function handleUpload(request: Request, env: Env, origin: string): Promise<Response> {
	const contentType = request.headers.get('content-type') ?? '';
	if (!contentType.includes('multipart/form-data')) {
		return badRequest('multipart/form-data で送信してください');
	}

	const form = await request.formData();
	const fileEntry = form.get('pdf');
	if (!(fileEntry instanceof File)) {
		return badRequest('pdf フィールドが必要です');
	}

	if (fileEntry.size === 0) {
		return badRequest('空ファイルはアップロードできません');
	}

	const accessPathRaw = String(form.get('accessPath') ?? '');
	const normalizedPath = normalizeAccessPath(accessPathRaw, fileEntry.name || 'upload.pdf');
	if (!normalizedPath) {
		return badRequest('access path は .pdf で終わる有効なパスを指定してください');
	}

	if (fileEntry.type && fileEntry.type !== 'application/pdf') {
		return badRequest('PDF ファイルのみアップロードできます');
	}

	const key = `pdfs/${normalizedPath}`;
	await env.PDF_BUCKET.put(key, fileEntry.stream(), {
		httpMetadata: {
			contentType: 'application/pdf',
			contentDisposition: `inline; filename="${normalizedPath.split('/').pop() ?? 'document.pdf'}"`,
			cacheControl: 'public, max-age=3600',
		},
		customMetadata: {
			uploadedAt: new Date().toISOString(),
		},
	});

	const publicPath = `/pdfs/${encodePath(normalizedPath)}`;
	return Response.json({
		ok: true,
		key,
		path: normalizedPath,
		url: `${origin}${publicPath}`,
	});
}

async function listPdfEntries(env: Env): Promise<PdfEntry[]> {
	const entries: PdfEntry[] = [];
	let cursor: string | undefined;

	do {
		const page = await env.PDF_BUCKET.list({
			prefix: 'pdfs/',
			cursor,
		});

		for (const object of page.objects) {
			if (!object.key.startsWith('pdfs/')) {
				continue;
			}
			const path = object.key.slice('pdfs/'.length);
			if (path.toLowerCase().endsWith('.pdf')) {
				entries.push({
					path,
					size: object.size,
					updatedAt: object.uploaded,
				});
			}
		}

		cursor = page.truncated ? page.cursor : undefined;
	} while (cursor);

	entries.sort((a, b) => a.path.localeCompare(b.path, 'en', { sensitivity: 'base' }));
	return entries;
}

export default {
	async fetch(request, env, ctx): Promise<Response> {
		const url = new URL(request.url);

		if (url.pathname === '/upload' && request.method === 'GET') {
			return new Response(uploadPageHtml, {
				headers: {
					'content-type': 'text/html; charset=utf-8',
				},
			});
		}

		if (url.pathname === '/' && request.method === 'GET') {
			const entries = await listPdfEntries(env);
			return new Response(listPageHtml(entries), {
				headers: {
					'content-type': 'text/html; charset=utf-8',
				},
			});
		}

		if (url.pathname === '/upload' && request.method === 'POST') {
			return handleUpload(request, env, url.origin);
		}

		if (url.pathname.startsWith('/pdfs/')) {
			const filePath = url.pathname.replace(/^\/pdfs\//, '');
			if (!filePath) {
				return new Response('PDF key is required', { status: 400 });
			}
			const key = `pdfs/${decodeURIComponent(filePath)}`;

			const object = await env.PDF_BUCKET.get(key);
			if (!object) {
				return new Response('Not Found', { status: 404 });
			}

			const headers = new Headers();
			headers.set('content-type', 'application/pdf');
			headers.set('content-disposition', `inline; filename="${key.split('/').pop() ?? 'document.pdf'}"`);
			headers.set('cache-control', 'public, max-age=3600');
			object.writeHttpMetadata(headers);
			headers.set('etag', object.httpEtag);

			return new Response(object.body, {
				headers,
			});
		}

		switch (url.pathname) {
			case '/message':
				return new Response('Hello, World! on custom');
			case '/random':
				return new Response(crypto.randomUUID());
			default:
				return new Response('Not Found', { status: 404 });
		}
	},
} satisfies ExportedHandler<Env>;
