import { GraphQLObjectType, GraphQLNonNull, GraphQLString } from 'graphql';

export const TableType = new GraphQLObjectType({
  name: 'Table',
  fields: {
    id: { type: new GraphQLNonNull(GraphQLString) },
    name: { type: new GraphQLNonNull(GraphQLString) }
  }
});
