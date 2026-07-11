import { readdirSync } from 'node:fs';
import { drizzle } from 'drizzle-orm/libsql';
import { type Client, createClient } from '@libsql/client/sqlite3';
import * as schema from './schema';

export async function seedDatabase(db: Client) {
	const drizzleDb = drizzle(db, { schema });

	const sampleTodos = [
		{
			title: 'プロジェクト設計書を作成',
			description: 'API仕様とデータベース設計を文書化する',
			completed: false,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		},
		{
			title: 'ユニットテストを実装',
			description: 'CRUD操作のテストケースを作成する',
			completed: false,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		},
		{
			title: 'デプロイメント設定',
			description: 'CI/CDパイプラインを構築する',
			completed: true,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		},
	];

	for (const todo of sampleTodos) {
		await drizzleDb.insert(schema.todosTable).values(todo);
	}

	console.log('Sample data inserted successfully');
}

const databaseFolder = '.wrangler/state/v3/d1/miniflare-D1DatabaseObject';
const localD1File = readdirSync(databaseFolder).find((filename) => filename.endsWith('.sqlite'));

if (!localD1File) {
	throw new Error('Could not find the local D1 database file');
}
seedDatabase(createClient({ url: `file:${databaseFolder}/${localD1File}` }));
