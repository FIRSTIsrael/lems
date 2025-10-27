import { GraphQLObjectType, GraphQLNonNull, GraphQLString } from 'graphql';

export const RoomType = new GraphQLObjectType({
  name: 'Room',
  fields: {
    id: { type: new GraphQLNonNull(GraphQLString) },
    name: { type: new GraphQLNonNull(GraphQLString) }
  }
});
