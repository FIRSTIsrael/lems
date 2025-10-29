import { GraphQLObjectType, GraphQLNonNull, GraphQLString, GraphQLBoolean } from 'graphql';

/**
 * GraphQL type for team arrival update payload
 * This is returned by both the mutation and subscription
 */
export const TeamArrivalPayloadType = new GraphQLObjectType({
  name: 'TeamArrivalPayload',
  fields: () => ({
    teamId: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The ID of the team'
    },
    divisionId: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The ID of the division'
    },
    arrived: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description: 'Whether the team has arrived'
    },
    updatedAt: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'ISO timestamp of when the update occurred'
    }
  })
});
