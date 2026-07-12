/* This file was automatically generated. DO NOT UPDATE MANUALLY. */
    import type   { Resolvers } from './types.generated';
    import    { article as Query_article } from './articles/resolvers/Query/article';
import    { articles as Query_articles } from './articles/resolvers/Query/articles';
import    { hello as Query_hello } from './hello/resolvers/Query/hello';
import    { createArticle as Mutation_createArticle } from './articles/resolvers/Mutation/createArticle';
import    { deleteArticle as Mutation_deleteArticle } from './articles/resolvers/Mutation/deleteArticle';
import    { updateArticle as Mutation_updateArticle } from './articles/resolvers/Mutation/updateArticle';
import    { Article } from './articles/resolvers/Article';
import    { DateTimeResolver } from 'graphql-scalars';
    export const resolvers: Resolvers = {
      Query: { article: Query_article,articles: Query_articles,hello: Query_hello },
      Mutation: { createArticle: Mutation_createArticle,deleteArticle: Mutation_deleteArticle,updateArticle: Mutation_updateArticle },
      
      Article: Article,
DateTime: DateTimeResolver
    }