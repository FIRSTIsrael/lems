import { eventResolvers } from './events/resolver';
import { divisionResolver } from './divisions/resolver';
import { teamsResolver } from './teams';
import { isFullySetUpResolver } from './events/is-fully-set-up';
import { eventDivisionsResolver } from './events/event-divisions';
import { volunteersResolver, volunteerDivisionsResolver } from './events/volunteers';
import { divisionTablesResolver } from './divisions/division-tables';
import { divisionRoomsResolver } from './divisions/division-rooms';
import { divisionTeamsResolver } from './divisions/division-teams';
import { divisionAwardsResolver } from './divisions/division-awards';
import { divisionJudgingResolver } from './divisions/judging';
import { judgingSessionsResolver } from './divisions/judging-sessions';
import { judgingRoomsResolver } from './divisions/judging-rooms';
import { judgingSessionLengthResolver } from './divisions/judging-session-length';
import { judgingSessionRoomResolver } from './judging/session-room';
import { judgingSessionTeamResolver } from './judging/session-team';
import { teamArrivalResolver } from './divisions/team-arrival';
import { mutationResolvers } from './mutations';
import { subscriptionResolvers } from './subscriptions';

export const resolvers = {
  Query: {
    events: eventResolvers.Query.events,
    event: eventResolvers.Query.event,
    division: divisionResolver,
    teams: teamsResolver
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
    awards: divisionAwardsResolver
  },
  Judging: {
    sessions: judgingSessionsResolver,
    rooms: judgingRoomsResolver,
    sessionLength: judgingSessionLengthResolver
  },
  JudgingSession: {
    room: judgingSessionRoomResolver,
    team: judgingSessionTeamResolver
  },
  Team: {
    arrived: teamArrivalResolver
  },
  Volunteer: {
    divisions: volunteerDivisionsResolver
  },
  RoleInfo: {
    __resolveType(obj: Record<string, unknown>) {
      // Discriminate union type based on object properties
      if ('tableId' in obj) return 'TableRoleInfo';
      if ('roomId' in obj) return 'RoomRoleInfo';
      if ('category' in obj) return 'CategoryRoleInfo';
      return null;
    }
  }
};
