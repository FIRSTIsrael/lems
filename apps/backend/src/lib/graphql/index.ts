import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLString,
  GraphQLBoolean,
  GraphQLInt
} from 'graphql';
import { eventResolvers } from './resolvers/events/resolver';
import { divisionResolver } from './resolvers/divisions/resolver';
import { teamsResolver } from './resolvers/teams';
import { EventType } from './types/event';
import { DivisionType } from './types/divisions/division';
import { RootTeamType } from './types/team';

const QueryType = new GraphQLObjectType({
  name: 'Query',
  fields: {
    events: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(EventType))),
      args: {
        fullySetUp: { type: GraphQLBoolean },
        startAfter: { type: GraphQLString },
        startBefore: { type: GraphQLString },
        endAfter: { type: GraphQLString },
        endBefore: { type: GraphQLString }
      },
      resolve: eventResolvers.Query.events
    },
    event: {
      type: EventType,
      args: {
        id: { type: GraphQLString },
        slug: { type: GraphQLString }
      },
      resolve: eventResolvers.Query.event
    },
    division: {
      type: DivisionType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) }
      },
      resolve: divisionResolver
    },
    teams: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(RootTeamType))),
      args: {
        ids: { type: new GraphQLList(new GraphQLNonNull(GraphQLString)) },
        searchTerm: { type: GraphQLString },
        limit: { type: GraphQLInt }
      },
      resolve: teamsResolver
    }
  }
});

export const schema = new GraphQLSchema({
  query: QueryType
});
