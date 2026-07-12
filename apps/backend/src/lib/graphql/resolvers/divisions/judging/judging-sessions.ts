import { GraphQLFieldResolver } from 'graphql';
import { JudgingSessionState } from '@lems/database';
import db from '../../../../database';

export interface JudgingSessionGraphQL {
  id: string;
  number: number;
  scheduledTime: string;
  status: string;
  called: boolean;
  queued: boolean;
  roomId: string;
  teamId: string | null;
  startTime?: string;
  startDelta?: number;
  divisionId: string;
}

interface JudgingWithDivisionId {
  divisionId: string;
}

interface SessionsArgs {
  ids?: string[];
  teamIds?: string[];
  roomId?: string;
  scheduledBefore?: string;
  scheduledAfter?: string;
}

/**
 * Resolver for Judging.sessions field.
 * Fetches judging sessions for a division, optionally filtered by IDs, room, or scheduled time.
 */
export const judgingSessionsResolver: GraphQLFieldResolver<
  JudgingWithDivisionId,
  unknown,
  SessionsArgs,
  Promise<JudgingSessionGraphQL[]>
> = async (judging: JudgingWithDivisionId, args: SessionsArgs) => {
  try {
    let sessions = await db.judgingSessions.byDivision(judging.divisionId).getAll();

    // Filter by IDs if provided
    if (args.ids && args.ids.length > 0) {
      const idsSet = new Set(args.ids);
      sessions = sessions.filter(session => idsSet.has(session.id));
    }

    // Filter by team IDs if provided
    if (args.teamIds && args.teamIds.length > 0) {
      const teamIdsSet = new Set(args.teamIds);
      sessions = sessions.filter(session => session.team_id && teamIdsSet.has(session.team_id));
    }

    // Filter by room ID if provided
    if (args.roomId) {
      sessions = sessions.filter(session => session.room_id === args.roomId);
    }

    // Filter by scheduled time if provided
    if (args.scheduledBefore) {
      const beforeTime = new Date(args.scheduledBefore);
      sessions = sessions.filter(session => session.scheduled_time < beforeTime);
    }

    if (args.scheduledAfter) {
      const afterTime = new Date(args.scheduledAfter);
      sessions = sessions.filter(session => session.scheduled_time > afterTime);
    }

    // Fetch state data from MongoDB for all sessions
    const mongo = db.raw.mongo;
    const sessionIds = sessions.map(s => s.id);
    const states = await mongo
      .collection<JudgingSessionState>('judging_session_states')
      .find({ sessionId: { $in: sessionIds } })
      .toArray();

    // Create a map of sessionId to state for quick lookup
    const stateMap = new Map(states.map(state => [state.sessionId, state]));

    // Build result with combined data
    return sessions.map(session => {
      const state = stateMap.get(session.id);

      if (!state) {
        throw new Error(`State for judging session ID ${session.id} not found`);
      }

      return {
        id: session.id,
        number: session.number,
        scheduledTime: session.scheduled_time.toISOString(),
        status: state.status,
        called: !!state.called,
        queued: !!state.queued,
        roomId: session.room_id,
        teamId: session.team_id,
        startTime: state.startTime ? state.startTime.toISOString() : undefined,
        startDelta: state.startDelta ?? undefined,
        divisionId: judging.divisionId
      };
    });
  } catch (error) {
    console.error('Error fetching judging sessions for division:', judging.divisionId, error);
    throw error;
  }
};
