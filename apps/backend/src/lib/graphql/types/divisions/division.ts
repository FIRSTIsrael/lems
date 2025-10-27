import { GraphQLObjectType, GraphQLList, GraphQLNonNull, GraphQLString } from 'graphql';
import { divisionTablesResolver } from '../../resolvers/divisions/division-tables';
import { divisionRoomsResolver } from '../../resolvers/divisions/division-rooms';
import { TableType } from './tables';
import { RoomType } from './rooms';

export const DivisionType = new GraphQLObjectType({
  name: 'Division',
  fields: {
    id: { type: new GraphQLNonNull(GraphQLString) },
    name: { type: new GraphQLNonNull(GraphQLString) },
    color: { type: new GraphQLNonNull(GraphQLString) },
    tables: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(TableType))),
      resolve: divisionTablesResolver
    },
    rooms: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(RoomType))),
      resolve: divisionRoomsResolver
    }
  }
});
