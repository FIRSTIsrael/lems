import { GraphQLScalarType, Kind } from 'graphql';
import { eventResolvers } from './events/resolver';
import { divisionResolver } from './divisions/resolver';
import { isFullySetUpResolver } from './events/is-fully-set-up';
import { eventDivisionsResolver } from './events/event-divisions';
import { volunteersResolver, volunteerDivisionsResolver } from './events/volunteers';
import { divisionTablesResolver } from './divisions/division-tables';
import { divisionRoomsResolver } from './divisions/division-rooms';
import { divisionTeamsResolver } from './divisions/division-teams';
import { divisionAwardsResolver } from './divisions/division-awards';
import { divisionFieldResolver } from './divisions/field/field';
import { divisionJudgingResolver } from './divisions/judging/judging';
import { judgingSessionsResolver } from './divisions/judging/judging-sessions';
import { judgingRoomsResolver } from './divisions/judging/judging-rooms';
import { judgingSessionLengthResolver } from './divisions/judging/judging-session-length';
import { judgingRubricsResolver } from './divisions/judging/judging-rubrics';
import { judgingSessionRoomResolver } from './judging/session-room';
import { judgingSessionTeamResolver } from './judging/session-team';
import { sessionRubricsResolver } from './judging/session-rubrics';
import { rubricTeamResolver, rubricDataResolver, rubricResolvers } from './judging/rubric';
import { teamArrivalResolver } from './divisions/team-arrival';
import { teamRubricsResolver } from './divisions/team-rubrics';
import { mutationResolvers } from './mutations';
import { subscriptionResolvers } from './subscriptions';

// JSON scalar resolver - passes through any valid JSON value
const JSONScalar = new GraphQLScalarType({
  name: 'JSON',
  description: 'Arbitrary JSON value',
  serialize: (value: unknown) => value,
  parseValue: (value: unknown) => value,
  parseLiteral: ast => {
    switch (ast.kind) {
      case Kind.STRING:
      case Kind.BOOLEAN:
        return ast.value;
      case Kind.INT:
      case Kind.FLOAT:
        return parseFloat(ast.value);
      case Kind.OBJECT:
        return Object.fromEntries(
          ast.fields.map(field => [field.name.value, JSONScalar.parseLiteral(field.value)])
        );
      case Kind.LIST:
        return ast.values.map(value => JSONScalar.parseLiteral(value));
      case Kind.NULL:
        return null;
      default:
        return null;
    }
  }
});

export const resolvers = {
  JSON: JSONScalar,
  Query: {
    events: eventResolvers.Query.events,
    event: eventResolvers.Query.event,
    division: divisionResolver
  },
  Mutation: mutationResolvers,
  Subscription: subscriptionResolvers,
  Event: {
    isFullySetUp: isFullySetUpResolver,
    divisions: eventDivisionsResolver,
    volunteers: volunteersResolver
  },
  Division: {
    tables: divisionTablesResolver,
    rooms: divisionRoomsResolver,
    teams: divisionTeamsResolver,
    judging: divisionJudgingResolver,
    field: divisionFieldResolver,
    awards: divisionAwardsResolver
  },
  Judging: {
    sessions: judgingSessionsResolver,
    rooms: judgingRoomsResolver,
    sessionLength: judgingSessionLengthResolver,
    rubrics: judgingRubricsResolver
  },
  JudgingSession: {
    room: judgingSessionRoomResolver,
    team: judgingSessionTeamResolver,
    rubrics: sessionRubricsResolver
  },
  Team: {
    arrived: teamArrivalResolver,
    rubrics: teamRubricsResolver
  },
  Rubric: {
    ...rubricResolvers,
    team: rubricTeamResolver,
    data: rubricDataResolver
  },
  Volunteer: {
    divisions: volunteerDivisionsResolver
  },
  RoleInfo: {
    __resolveType(obj: Record<string, unknown>) {
      if ('tableId' in obj) return 'TableRoleInfo';
      if ('roomId' in obj) return 'RoomRoleInfo';
      if ('category' in obj) return 'CategoryRoleInfo';
      return null;
    }
  },
  RubricUpdatedEvent: {
    __resolveType(obj: Record<string, unknown>) {
      if ('fieldId' in obj) return 'RubricValueUpdated';
      if ('feedback' in obj) return 'RubricFeedbackUpdated';
      if ('status' in obj) return 'RubricStatusUpdated';
      if ('awards' in obj) return 'RubricAwardsUpdated';
      return null;
    }
  }
};
