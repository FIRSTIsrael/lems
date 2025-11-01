import { GraphQLObjectType, GraphQLNonNull, GraphQLString } from 'graphql';

export const RootTeamType = new GraphQLObjectType({
  name: 'RootTeam',
  fields: {
    id: { type: new GraphQLNonNull(GraphQLString) },
    number: { type: new GraphQLNonNull(GraphQLString) },
    name: { type: new GraphQLNonNull(GraphQLString) },
    affiliation: { type: new GraphQLNonNull(GraphQLString) },
    city: { type: new GraphQLNonNull(GraphQLString) },
    location: { type: GraphQLString }
  }
});
