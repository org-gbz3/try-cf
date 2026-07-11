import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import { todosTable } from './db/schema';

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
	const id = c.req.param('id');
	const db = drizzle(c.env.DB);

	try {
		const todo = await db
			.select()
			.from(todosTable)
			.where(eq(todosTable.id, Number(id)))
			.get();

		if (!todo) {
			return c.json({ success: false, error: 'Todo not found' }, 404);
		}

		return c.json({ success: true, data: todo });
	} catch (error) {
		return c.json({ success: false, error: 'Failed to fetch todo' }, 500);
	}
});

export default app;
