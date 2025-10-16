import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLString,
  GraphQLBoolean
} from 'graphql';
import { eventResolvers } from './resolvers/events/resolver';
import { isFullySetUpResolver } from './resolvers/events/is-fully-set-up';
import { volunteerRolesResolver } from './resolvers/events/volunteer-roles';

const EventType = new GraphQLObjectType({
  name: 'Event',
  fields: {
    id: { type: new GraphQLNonNull(GraphQLString) },
    slug: { type: new GraphQLNonNull(GraphQLString) },
    name: { type: new GraphQLNonNull(GraphQLString) },
    startDate: { type: new GraphQLNonNull(GraphQLString) },
    endDate: { type: new GraphQLNonNull(GraphQLString) },
    isFullySetUp: {
      type: new GraphQLNonNull(GraphQLBoolean),
      resolve: isFullySetUpResolver
    },
    volunteerRoles: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GraphQLString))),
      resolve: volunteerRolesResolver
    }
  }
});

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
    }
  }
});

export const schema = new GraphQLSchema({
  query: QueryType
});
