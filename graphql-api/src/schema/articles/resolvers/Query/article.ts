import { eq } from 'drizzle-orm';
import { getContext } from '../../../../context';
import { articlesTable } from '../../../../db/schema';
import type { QueryResolvers } from './../../../types.generated';

export const article: NonNullable<QueryResolvers['article']> = async (_parent, _arg, _ctx) => {
	const { db } = getContext();
	return await db.query.articlesTable.findFirst({
		where: eq(articlesTable.id, Number(_arg.id)),
	});
};
