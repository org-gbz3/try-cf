/* This file was automatically generated. DO NOT UPDATE MANUALLY. */
    import type   { Resolvers } from './types.generated';
    import    { hello as Query_hello } from './hello/resolvers/Query/hello';
import    { DateTimeResolver } from 'graphql-scalars';
    export const resolvers: Resolvers = {
      Query: { hello: Query_hello },
      
      
      DateTime: DateTimeResolver
    }