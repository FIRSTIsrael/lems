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
import { updateTeamArrivalResolver } from './websocket/mutations/update-team-arrival';
import { teamArrivalUpdatedResolver } from './websocket/subscriptions/team-arrival-subscription';
import { EventType } from './types/event';
import { DivisionType } from './types/divisions/division';
import { RootTeamType } from './types/team';
import { TeamArrivalPayloadType } from './types/divisions/team-arrival';

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

const MutationType = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    updateTeamArrival: {
      type: new GraphQLNonNull(TeamArrivalPayloadType),
      args: {
        teamId: { type: new GraphQLNonNull(GraphQLString) },
        arrived: { type: new GraphQLNonNull(GraphQLBoolean) },
        divisionId: { type: GraphQLString }
      },
      resolve: updateTeamArrivalResolver,
      description:
        'Update the arrival status of a team. DivisionId can be provided as an argument or from WebSocket context.'
    }
  }
});

const SubscriptionType = new GraphQLObjectType({
  name: 'Subscription',
  fields: {
    teamArrivalUpdated: {
      type: new GraphQLNonNull(TeamArrivalPayloadType),
      args: {},
      subscribe: teamArrivalUpdatedResolver,
      description: 'Subscribe to team arrival status updates for your connected division'
    }
  }
});

export const schema = new GraphQLSchema({
  query: QueryType,
  mutation: MutationType,
  subscription: SubscriptionType
});
