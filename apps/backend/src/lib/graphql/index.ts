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
import { volunteersResolver, divisionsResolver } from './resolvers/events/volunteers';
import { eventDivisionsResolver } from './resolvers/events/event-divisions';

const DivisionType = new GraphQLObjectType({
  name: 'Division',
  fields: {
    id: { type: new GraphQLNonNull(GraphQLString) }
  }
});

const VolunteerType = new GraphQLObjectType({
  name: 'Volunteer',
  fields: {
    role: { type: new GraphQLNonNull(GraphQLString) },
    divisions: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(DivisionType))),
      resolve: divisionsResolver
    }
  }
});

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
    divisions: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(DivisionType))),
      resolve: eventDivisionsResolver
    },
    volunteers: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(VolunteerType))),
      args: {
        role: { type: GraphQLString }
      },
      resolve: volunteersResolver
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
