import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import { todosTable } from './db/schema';
import { zValidator } from '@hono/zod-validator';
import * as z from 'zod/mini';
import { waitUntil } from 'cloudflare:workers';

const STALE_WHILE_REVALIDATE = 60;

type CacheData = {
	staleWhileRevalidate: number;
	data: typeof todosTable.$inferSelect;
};

async function saveCache(cache: KVNamespace, cacheKey: string, todo: typeof todosTable.$inferSelect) {
	const execute = async () => {
		const staleWhileRevalidateTime = new Date();
		staleWhileRevalidateTime.setSeconds(staleWhileRevalidateTime.getSeconds() + STALE_WHILE_REVALIDATE);
		const saveData: CacheData = {
			staleWhileRevalidate: staleWhileRevalidateTime.getTime(),
			data: todo,
		};
		await cache.put(cacheKey, JSON.stringify(saveData), {
			expirationTtl: 60 * 5, // TTL (sec)
		});
	};

	waitUntil(execute());
}

async function getCache(
	cache: KVNamespace,
	cacheKey: string,
	saveDataFunction: () => Promise<typeof todosTable.$inferSelect | undefined>,
): Promise<typeof todosTable.$inferSelect | undefined> {
	const cachedData = await cache.get<CacheData>(cacheKey, 'json');

	if (cachedData) {
		console.log(`Cache hit: ${JSON.stringify(cachedData)}`);
		if (cachedData.staleWhileRevalidate < Date.now()) {
			// 古いキャッシュを応答し、裏でキャッシュを更新する
			waitUntil(
				(async () => {
					const saveData = await saveDataFunction();
					if (saveData) saveCache(cache, cacheKey, saveData);
				})(),
			);
		}

		return cachedData.data;
	}

	const freshData = await saveDataFunction();
	if (freshData) saveCache(cache, cacheKey, freshData);

	return freshData;
}

async function deleteCache(cache: KVNamespace, cacheKey: string) {
	waitUntil(cache.delete(cacheKey));
}

const app = new Hono<{ Bindings: Env }>();

// 全ての Todo を取得
app.get('/api/todos', async (c) => {
	const db = drizzle(c.env.DB);

	try {
		const allTodos = await db.select().from(todosTable).all();
		return c.json({
			success: true,
			data: allTodos,
		});
	} catch (error) {
		return c.json({ success: false, error: 'Failed to fetch todos' }, 500);
	}
});

// 特定の Todo を取得
app.get('/api/todos/:id', async (c) => {
	const cache = c.env.RESPONSE_CACHE;
	const cacheKey = c.req.path;

	const id = c.req.param('id');
	const db = drizzle(c.env.DB);

	try {
		const todo = await getCache(cache, cacheKey, async () => {
			return await db
				.select()
				.from(todosTable)
				.where(eq(todosTable.id, Number(id)))
				.get();
		});

		if (!todo) {
			return c.json({ success: false, error: 'Todo not found' }, 404);
		}

		return c.json({ success: true, data: todo });
	} catch (error) {
		return c.json({ success: false, error: 'Failed to fetch todo' }, 500);
	}
});

// 新しい Todo を作成
app.post(
	'/api/todos',
	zValidator(
		'json',
		z.object({
			title: z.string().check(z.maxLength(255)),
			description: z.optional(z.string()),
		}),
	),
	async (c) => {
		const db = drizzle(c.env.DB);

		try {
			const json = c.req.valid('json');

			const newTodo = await db
				.insert(todosTable)
				.values({
					title: json.title,
					description: json.description || null,
					completed: false,
					createdAt: new Date().toISOString(),
					updatedAt: new Date().toISOString(),
				})
				.returning();

			return c.json({ success: true, data: newTodo[0] }, 201);
		} catch (error) {
			return c.json({ success: false, error: 'Failed to create todo' }, 500);
		}
	},
);

// Todo を更新
app.put(
	'/api/todos/:id',
	zValidator(
		'param',
		z.object({
			id: z.pipe(
				z.transform((v) => Number(v)),
				z.number(),
			),
		}),
	),
	zValidator(
		'json',
		z.object({
			title: z.optional(z.string().check(z.maxLength(255))),
			description: z.nullish(z.string()),
			completed: z.optional(z.boolean()),
		}),
	),
	async (c) => {
		const id = c.req.valid('param').id;
		const db = drizzle(c.env.DB);

		try {
			const json = c.req.valid('json');

			// 存在チェック
			const existingTodo = await db.select().from(todosTable).where(eq(todosTable.id, id)).limit(1);

			if (existingTodo.length === 0) {
				return c.json({ success: false, error: 'Todo not found' }, 404);
			}

			const updatedTodo = await db.update(todosTable).set(json).where(eq(todosTable.id, id)).returning();
			saveCache(c.env.RESPONSE_CACHE, c.req.path, updatedTodo[0]);

			return c.json({ success: true, data: updatedTodo[0] });
		} catch (error) {
			return c.json({ success: false, error: 'Failed to update todo' }, 500);
		}
	},
);

// Todo を削除
app.delete(
	'/api/todos/:id',
	zValidator(
		'param',
		z.object({
			id: z.pipe(
				z.transform((v) => Number(v)),
				z.number(),
			),
		}),
	),
	async (c) => {
		const id = c.req.valid('param').id;
		const db = drizzle(c.env.DB);

		try {
			const deletedTodo = await db.delete(todosTable).where(eq(todosTable.id, id)).returning();

			if (deletedTodo.length === 0) {
				return c.json({ success: false, error: 'Todo not found' }, 404);
			}

			deleteCache(c.env.RESPONSE_CACHE, c.req.path);
			return c.json({ success: true, message: 'Todo deleted successfully', data: deletedTodo[0] });
		} catch (error) {
			return c.json({ success: false, error: 'Failed to delete todo' }, 500);
		}
	},
);

export default app;
