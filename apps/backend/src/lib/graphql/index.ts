import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLString,
  GraphQLBoolean
} from 'graphql';
import { eventResolvers } from './resolvers/event';

const EventType = new GraphQLObjectType({
  name: 'Event',
  fields: {
    id: { type: new GraphQLNonNull(GraphQLString) },
    slug: { type: new GraphQLNonNull(GraphQLString) },
    name: { type: new GraphQLNonNull(GraphQLString) },
    startDate: { type: new GraphQLNonNull(GraphQLString) },
    endDate: { type: new GraphQLNonNull(GraphQLString) },
    isFullySetUp: { type: new GraphQLNonNull(GraphQLBoolean) }
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
        id: { type: new GraphQLNonNull(GraphQLString) }
      },
      resolve: eventResolvers.Query.event
    },
    eventBySlug: {
      type: EventType,
      args: {
        slug: { type: new GraphQLNonNull(GraphQLString) }
      },
      resolve: eventResolvers.Query.eventBySlug
    }
  }
});

export const schema = new GraphQLSchema({
  query: QueryType
});
