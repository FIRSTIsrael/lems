/**
 * Apollo Server GraphQL implementation
 *
 * Public exports:
 * - createApolloServer: Factory function to create and configure Apollo Server
 * - GraphQLContext: TypeScript interface for resolver context
 * - typeDefs: GraphQL schema definition (merged SDL files)
 * - resolvers: Resolver map for all Query, Mutation, and type fields
 */

export { createApolloServer, type GraphQLContext, typeDefs } from './apollo-server';
export { resolvers } from './resolvers';
