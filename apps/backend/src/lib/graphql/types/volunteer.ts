import {
  GraphQLObjectType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLString,
  GraphQLUnionType
} from 'graphql';
import { volunteerDivisionsResolver } from '../resolvers/events/volunteers';
import { DivisionType } from './divisions/division';

const TableRoleInfoType = new GraphQLObjectType({
  name: 'TableRoleInfo',
  fields: {
    tableId: { type: new GraphQLNonNull(GraphQLString) }
  }
});

const RoomRoleInfoType = new GraphQLObjectType({
  name: 'RoomRoleInfo',
  fields: {
    roomId: { type: new GraphQLNonNull(GraphQLString) }
  }
});

const CategoryRoleInfoType = new GraphQLObjectType({
  name: 'CategoryRoleInfo',
  fields: {
    category: { type: new GraphQLNonNull(GraphQLString) }
  }
});

const RoleInfoType = new GraphQLUnionType({
  name: 'RoleInfo',
  types: [TableRoleInfoType, RoomRoleInfoType, CategoryRoleInfoType],
  resolveType(value) {
    if ('tableId' in value) {
      return 'TableRoleInfo';
    }
    if ('roomId' in value) {
      return 'RoomRoleInfo';
    }
    if ('category' in value) {
      return 'CategoryRoleInfo';
    }
    return null;
  }
});

export const VolunteerType = new GraphQLObjectType({
  name: 'Volunteer',
  fields: {
    id: { type: new GraphQLNonNull(GraphQLString) },
    role: { type: new GraphQLNonNull(GraphQLString) },
    roleInfo: { type: RoleInfoType },
    identifier: { type: GraphQLString },
    divisions: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(DivisionType))),
      resolve: volunteerDivisionsResolver
    }
  }
});
