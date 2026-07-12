import type { QueryResolvers } from './../../../types.generated';
import { getContext } from '../../../../context';
import { articlesTable } from '../../../../db/schema';

export const hello: NonNullable<QueryResolvers['hello']> = async (_parent, _arg, _ctx) => {
	const { db } = getContext();
	const article = await db.select().from(articlesTable);
	return 'world';
};
