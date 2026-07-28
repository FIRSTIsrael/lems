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

    let participants = matchData.participants;

    // Filter by table IDs if provided
    if (args.tableIds && args.tableIds.length > 0) {
      const tableIdsSet = new Set(args.tableIds);
      participants = participants.filter(p => tableIdsSet.has(p.table_id));
    }

    return participants.map(participant => ({
      id: participant.id,
      teamId: participant.team_id,
      tableId: participant.table_id,
      queued: !!participant.queued,
      present: !!participant.present,
      ready: !!participant.ready,
      divisionId: match.divisionId,
      matchId: match.id
    }));
  } catch (error) {
    console.error('Error fetching match participants for match:', match.id, error);
    throw error;
  }
};
