import {
  GraphQLObjectType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLString,
  GraphQLBoolean
} from 'graphql';
import { isFullySetUpResolver } from '../resolvers/events/is-fully-set-up';
import { volunteersResolver } from '../resolvers/events/volunteers';
import { eventDivisionsResolver } from '../resolvers/events/event-divisions';
import { VolunteerType } from './volunteer';
import { DivisionType } from './divisions/division';

export const EventType = new GraphQLObjectType({
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
