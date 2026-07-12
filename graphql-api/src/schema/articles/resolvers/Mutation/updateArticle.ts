import { eq } from 'drizzle-orm';
import { getContext } from '../../../../context';
import { articlesTable } from '../../../../db/schema';
import type { MutationResolvers } from './../../../types.generated';

export const updateArticle: NonNullable<MutationResolvers['updateArticle']> = async (_parent, _arg, _ctx) => {
	const { title, content, imageUrl, tags, isPublished } = _arg.input;
	const { db } = getContext();

	const article = await db
		.update(articlesTable)
		.set({
			title: title != null ? title : articlesTable.title,
			content: content != null ? content : articlesTable.content,
			imageUrl: imageUrl !== undefined ? imageUrl : articlesTable.imageUrl,
			tags: tags != null ? tags : articlesTable.tags,
			isPublished: isPublished != null ? isPublished : articlesTable.isPublished,
		})
		.where(eq(articlesTable.id, Number(_arg.id)))
		.returning();

	return article[0];
};
