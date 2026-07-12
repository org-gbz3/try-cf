import { eq } from 'drizzle-orm';
import { getContext } from '../../../../context';
import { articlesTable } from '../../../../db/schema';
import type { QueryResolvers } from './../../../types.generated';

export const articles: NonNullable<QueryResolvers['articles']> = async (_parent, _arg, _ctx) => {
	const { published, limit, offset } = _arg;
	const { db } = getContext();

	return await db.query.articlesTable.findMany({
		where: published ? eq(articlesTable.isPublished, published) : undefined,
		limit,
		offset,
	});
};
