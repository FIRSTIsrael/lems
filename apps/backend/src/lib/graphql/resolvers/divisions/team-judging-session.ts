import { GraphQLFieldResolver } from 'graphql';
import db from '../../../database';
import { JudgingSessionGraphQL } from './judging/judging-sessions';

interface TeamWithDivisionId {
  id: string;
  divisionId: string;
}

/**
 * Resolver for Team.judgingSession field.
 * Fetches the judging session for this team in the division.
 */
export const teamJudgingSessionResolver: GraphQLFieldResolver<
  TeamWithDivisionId,
  unknown,
  unknown,
  Promise<JudgingSessionGraphQL | null>
> = async (team: TeamWithDivisionId) => {
  try {
    // Get the session for this team
    const session = await db.judgingSessions.byDivision(team.divisionId).getByTeam(team.id);

    if (!session) {
      return null;
    }

    // Fetch state data from MongoDB
    const state = await db.judgingSessions.byId(session.id).state().get();

    return {
      id: session.id,
      number: session.number,
      scheduledTime: session.scheduled_time.toISOString(),
      status: state?.status || 'not-started',
      called: !!state?.called,
      queued: !!state?.queued,
      roomId: session.room_id,
      teamId: session.team_id,
      startTime: state?.startTime ? new Date(state.startTime).toISOString() : undefined,
      startDelta: state?.startTime
        ? Math.floor(
            (new Date(state.startTime).getTime() - session.scheduled_time.getTime()) / 1000
          )
        : undefined,
      divisionId: team.divisionId
    };
  } catch (error) {
    console.error('Error fetching judging session for team:', team.id, error);
    throw error;
  }
};
