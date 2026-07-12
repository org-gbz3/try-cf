import { sql } from 'drizzle-orm';
import { pgTable, text, integer, timestamp, boolean } from 'drizzle-orm/pg-core';

export const articlesTable = pgTable('articles', {
	id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
	title: text('title').notNull(),
	content: text('content').notNull(),
	author: text('author').notNull(),
	publishedAt: timestamp('published_at'),
	imageUrl: text('image_url'),
	tags: text('tags')
		.array()
		.notNull()
		.default(sql`'{}'::text[]`),
	isPublished: boolean('is_published').notNull().default(false),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
