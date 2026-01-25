import { GraphQLScalarType, Kind } from 'graphql';
import db from '../../database';
import { eventResolvers } from './events/resolver';
import { divisionResolver } from './divisions/resolver';
import { isFullySetUpResolver } from './events/is-fully-set-up';
import { eventDivisionsResolver } from './events/event-divisions';
import {
  volunteersResolver,
  volunteerDivisionsResolver,
  RoleInfoResolver
} from './events/volunteers';
import { divisionTablesResolver } from './divisions/division-tables';
import { divisionRoomsResolver } from './divisions/division-rooms';
import { divisionTeamsResolver } from './divisions/division-teams';
import { divisionAgendaResolver } from './divisions/division-agenda';
import { divisionFieldResolver } from './divisions/field/field';
import { divisionJudgingResolver } from './divisions/judging/judging';
import { judgingSessionsResolver } from './divisions/judging/judging-sessions';
import { judgingRoomsResolver } from './divisions/judging/judging-rooms';
import { judgingSessionLengthResolver } from './divisions/judging/judging-session-length';
import { judgingAdvancementPercentageResolver } from './divisions/judging/judging-advancement-percentage';
import { judgingRubricsResolver } from './divisions/judging/judging-rubrics';
import { judgingDeliberationResolver } from './divisions/judging/judging-deliberation';
import { judgingFinalDeliberationResolver } from './divisions/judging/judging-final-deliberation';
import { judgingAwardsResolver } from './divisions/judging/judging-awards';
import { awardWinnerResolver } from './divisions/judging/award-winner';
import { judgingSessionRoomResolver } from './judging/session-room';
import { judgingSessionTeamResolver } from './judging/session-team';
import { sessionRubricsResolver } from './judging/session-rubrics';
import { rubricTeamResolver, rubricDataResolver, rubricResolvers } from './judging/rubric';
import {
  scoresheetTeamResolver,
  scoresheetDataResolver,
  scoresheetTableResolver,
  scoresheetResolvers
} from './field/scoresheet';
import { teamArrivalResolver } from './divisions/team-arrival';
import { teamRubricsResolver } from './divisions/team-rubrics';
import { teamJudgingSessionResolver } from './divisions/team-judging-session';
import { teamScoresheetsResolver } from './divisions/team-scoresheets';
import { teamDisqualifiedResolver } from './divisions/team-disqualified';
import { mutationResolvers } from './mutations';
import { subscriptionResolvers } from './subscriptions';
import { matchesResolver } from './divisions/field/matches';
import { matchLengthResolver } from './divisions/field/match-length';
import { currentStageResolver } from './divisions/field/current-stage';
import { matchParticipantsResolver } from './divisions/field/match-participants';
import { matchParticipantTeamResolver } from './divisions/field/match-participant-team';
import { matchParticipantTableResolver } from './divisions/field/match-partitipant-table';
import { matchParticipantScoresheetResolver } from './divisions/field/match-participant-scoresheet';
import { audienceDisplayResolver } from './divisions/field/audience-display';
import { fieldScoresheetsResolver } from './divisions/field/scoresheets';
import { RubricUpdatedEventResolver } from './subscriptions/rubrics/rubric-updated';
import { ScoresheetUpdatedEventResolver } from './subscriptions/scoresheet/scoresheet-updated';
import {
  DeliberationUpdatedEventResolver,
  FinalDeliberationUpdatedEventResolver
} from './subscriptions/deliberations';

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
    seasonName: async event => {
      const dbEvent = await db.events.byId(event.id).get();
      if (!dbEvent) {
        return null;
      }

      const season = await db.seasons.byId(dbEvent.season_id).get();
      return season?.name ?? null;
    },
    divisions: eventDivisionsResolver,
    volunteers: volunteersResolver
  },
  Division: {
    tables: divisionTablesResolver,
    rooms: divisionRoomsResolver,
    teams: divisionTeamsResolver,
    judging: divisionJudgingResolver,
    field: divisionFieldResolver,
    agenda: divisionAgendaResolver
  },
  Judging: {
    sessions: judgingSessionsResolver,
    rooms: judgingRoomsResolver,
    sessionLength: judgingSessionLengthResolver,
    advancementPercentage: judgingAdvancementPercentageResolver,
    rubrics: judgingRubricsResolver,
    deliberation: judgingDeliberationResolver,
    finalDeliberation: judgingFinalDeliberationResolver,
    awards: judgingAwardsResolver
  },
  Award: {
    winner: awardWinnerResolver
  },
  Field: {
    audienceDisplay: audienceDisplayResolver,
    matches: matchesResolver,
    matchLength: matchLengthResolver,
    currentStage: currentStageResolver,
    scoresheets: fieldScoresheetsResolver
  },
  Match: {
    participants: matchParticipantsResolver
  },
  MatchParticipant: {
    team: matchParticipantTeamResolver,
    table: matchParticipantTableResolver,
    scoresheet: matchParticipantScoresheetResolver
  },
  JudgingSession: {
    room: judgingSessionRoomResolver,
    team: judgingSessionTeamResolver,
    rubrics: sessionRubricsResolver
  },
  Team: {
    arrived: teamArrivalResolver,
    rubrics: teamRubricsResolver,
    judgingSession: teamJudgingSessionResolver,
    scoresheets: teamScoresheetsResolver,
    disqualified: teamDisqualifiedResolver
  },
  Rubric: {
    ...rubricResolvers,
    team: rubricTeamResolver,
    data: rubricDataResolver
  },
  Scoresheet: {
    ...scoresheetResolvers,
    team: scoresheetTeamResolver,
    data: scoresheetDataResolver,
    table: scoresheetTableResolver
  },
  Volunteer: {
    divisions: volunteerDivisionsResolver
  },
  RoleInfo: RoleInfoResolver,
  RubricUpdatedEvent: RubricUpdatedEventResolver,
  ScoresheetUpdatedEvent: ScoresheetUpdatedEventResolver,
  DeliberationUpdatedEvent: DeliberationUpdatedEventResolver,
  FinalDeliberationUpdatedEvent: FinalDeliberationUpdatedEventResolver
};
