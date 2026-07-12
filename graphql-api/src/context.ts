import { AsyncLocalStorage } from 'node:async_hooks';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './db/schema';

export type Context = {
	db: ReturnType<typeof drizzle<typeof schema>>;
	env: Env;
};

const contextStorage = new AsyncLocalStorage<Context>();

export const createContext = (env: Env, handler: () => Promise<Response> | Response) => {
	const queryClient = postgres(env.HYPERDRIVE.connectionString);
	const db = drizzle({ schema, client: queryClient });

	return contextStorage.run({ db, env }, handler);
};

export const getContext = () => {
	const store = contextStorage.getStore();
	if (!store) {
		throw new Error('No context available');
	}
	return store;
};
