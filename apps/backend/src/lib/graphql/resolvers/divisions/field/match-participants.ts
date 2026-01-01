import { GraphQLFieldResolver } from 'graphql';
import db from '../../../../database';
import { MatchGraphQL } from './matches';

interface ParticipantsArgs {
  tableIds?: string[];
}

export interface MatchParticipantGraphQL {
  id: string;
  tableId: string;
  teamId: string | null;
  queued: boolean;
  present: boolean;
  ready: boolean;
  divisionId: string;
  matchId: string;
}

/**
 * Resolver for Match.participants field.
 * This resolver only executes when the participants field is explicitly requested.
 * Fetches match participants, optionally filtered by table IDs.
 */
export const matchParticipantsResolver: GraphQLFieldResolver<
  MatchGraphQL,
  unknown,
  ParticipantsArgs,
  Promise<MatchParticipantGraphQL[]>
> = async (match: MatchGraphQL, args: ParticipantsArgs) => {
  try {
    // Get the match with all participants
    const matchData = await db.robotGameMatches.byId(match.id).get();

    if (!matchData) {
      throw new Error(`Match not found for match ID: ${match.id}`);
    }

    // Get the match state to determine queued/present/ready status
    const mongo = db.raw.mongo;
    const state = await mongo.collection('robot_game_match_states').findOne({ matchId: match.id });

    if (!state) {
      throw new Error(`State not found for match ID: ${match.id}`);
    }

    let participants = matchData.participants;

    // Filter by table IDs if provided
    if (args.tableIds && args.tableIds.length > 0) {
      const tableIdsSet = new Set(args.tableIds);
      participants = participants.filter(p => tableIdsSet.has(p.table_id));
    }

    return participants.map(participant => {
      const participantState = state.participants[participant.table_id] || {
        queued: null,
        present: null,
        ready: null
      };

      return {
        id: participant.id,
        teamId: participant.team_id,
        tableId: participant.table_id,
        queued: !!participantState.queued,
        present: !!participantState.present,
        ready: !!participantState.ready,
        divisionId: match.divisionId,
        matchId: match.id
      };
    });
  } catch (error) {
    console.error('Error fetching match participants for match:', match.id, error);
    throw error;
  }
};
