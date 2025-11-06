import { GraphQLObjectType, GraphQLNonNull, GraphQLString, GraphQLBoolean } from 'graphql';
import { teamArrivalResolver } from '../../resolvers/divisions/team-arrival';

export const TeamType = new GraphQLObjectType({
  name: 'Team',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLString) },
    number: { type: new GraphQLNonNull(GraphQLString) },
    name: { type: new GraphQLNonNull(GraphQLString) },
    affiliation: { type: new GraphQLNonNull(GraphQLString) },
    city: { type: new GraphQLNonNull(GraphQLString) },
    location: { type: GraphQLString },
    arrived: {
      type: new GraphQLNonNull(GraphQLBoolean),
      resolve: teamArrivalResolver
    }
  })
});
