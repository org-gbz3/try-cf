import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const todosTable = sqliteTable('todos', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	title: text('title').notNull(),
	description: text('description'),
	completed: integer('completed', { mode: 'boolean' }).notNull().default(false),
	createdAt: text('created_at').notNull(),
	updatedAt: text('updated_at').notNull(),
});

export const filesTable = sqliteTable('files', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	fileName: text('file_name').notNull(),
	originalName: text('original_name').notNull(),
	fileSize: integer('file_size').notNull(),
	mimeType: text('mime_type').notNull(),
	uploadedAt: text('uploaded_at').notNull(),
});
