import { eq } from 'drizzle-orm';
import { getContext } from '../../../../context';
import { articlesTable } from '../../../../db/schema';
import type { MutationResolvers } from './../../../types.generated';

export const deleteArticle: NonNullable<MutationResolvers['deleteArticle']> = async (_parent, _arg, _ctx) => {
	const { db } = getContext();
	const result = await db.delete(articlesTable).where(eq(articlesTable.id, Number(_arg.id)));

	return result.count === 1;
};
