/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.jsonc`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

// export default {
// 	async fetch(request, env, ctx): Promise<Response> {
// 		return new Response("Hello World!");
// 	},
// } satisfies ExportedHandler<Env>;
import { createYoga, createSchema } from 'graphql-yoga';
import { typeDefs } from './schema/typeDefs.generated';
import { resolvers } from './schema/resolvers.generated';
import { createContext } from './context';

const yoga = createYoga({
	schema: createSchema({ typeDefs, resolvers }),
});

export default {
	async fetch(request, env, ctx): Promise<Response> {
		return createContext(env, () => yoga.fetch(request));
	},
} satisfies ExportedHandler<Env>;
