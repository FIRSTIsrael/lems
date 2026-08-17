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

    return {
      id: session.id,
      number: session.number,
      scheduledTime: session.scheduled_time.toISOString(),
      status: session.status,
      called: !!session.called,
      queued: !!session.queued,
      roomId: session.room_id,
      teamId: session.team_id,
      startTime: session.start_time ? session.start_time.toISOString() : undefined,
      startDelta: session.start_delta ?? undefined,
      divisionId: team.divisionId
    };
  } catch (error) {
    console.error('Error fetching judging session for team:', team.id, error);
    throw error;
  }
};
