import { getContext } from '../../../../context';
import { articlesTable } from '../../../../db/schema';
import type { MutationResolvers } from './../../../types.generated';

export const createArticle: NonNullable<MutationResolvers['createArticle']> = async (_parent, _arg, _ctx) => {
	const { title, content, author, imageUrl, tags, isPublished } = _arg.input;
	const { db } = getContext();

	const article = await db
		.insert(articlesTable)
		.values({
			title,
			content,
			author,
			imageUrl,
			tags: tags != null ? tags : undefined,
			isPublished: isPublished != null ? isPublished : undefined,
		})
		.returning();

	return article[0];
};
