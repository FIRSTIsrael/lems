import { GraphQLFieldResolver } from 'graphql';
import { RobotGameMatchState } from '@lems/database';
import db from '../../../../database';

export interface MatchGraphQL {
  id: string;
  slug: string;
  stage: string;
  round: number;
  number: number;
  scheduledTime: string;
  status: string;
  called: boolean;
  startTime?: string;
  startDelta?: number;
  divisionId: string;
}

interface FieldWithDivisionId {
  divisionId: string;
}

interface MatchesArgs {
  ids?: string[];
  stage?: string;
  matchNumbers?: number[];
}

/**
 * Resolver for Field.matches field.
 * Fetches robot game matches for a division, optionally filtered by IDs, stage, or match numbers.
 */
export const matchesResolver: GraphQLFieldResolver<
  FieldWithDivisionId,
  unknown,
  MatchesArgs,
  Promise<MatchGraphQL[]>
> = async (field: FieldWithDivisionId, args: MatchesArgs) => {
  try {
    let matches = await db.robotGameMatches.byDivision(field.divisionId).getAll();

    // Filter by IDs if provided
    if (args.ids && args.ids.length > 0) {
      const idsSet = new Set(args.ids);
      matches = matches.filter(match => idsSet.has(match.id));
    }

    // Filter by stage if provided
    if (args.stage) {
      matches = matches.filter(match => match.stage === args.stage);
    }

    // Filter by match numbers if provided
    if (args.matchNumbers && args.matchNumbers.length > 0) {
      const numbersSet = new Set(args.matchNumbers);
      matches = matches.filter(match => numbersSet.has(match.number));
    }

    // Fetch state data from MongoDB for all matches
    const mongo = db.raw.mongo;
    const matchIds = matches.map(m => m.id);
    const states = await mongo
      .collection<RobotGameMatchState>('robot_game_match_states')
      .find({ matchId: { $in: matchIds } })
      .toArray();

    // Create a map of matchId to state for quick lookup
    const stateMap = new Map(states.map(state => [state.matchId, state]));

    // Build result with combined data
    return matches.map(match => {
      const state = stateMap.get(match.id);

      if (!state) {
        throw new Error(`State for robot game match ID ${match.id} not found`);
      }

      const slug = `R${match.round}M${match.number}`;

      return {
        id: match.id,
        slug,
        stage: match.stage,
        round: match.round,
        number: match.number,
        scheduledTime: match.scheduled_time.toISOString(),
        status: state.status,
        called: !!state.called,
        startTime: state.startTime ? state.startTime.toISOString() : undefined,
        startDelta: state.startDelta ?? undefined,
        divisionId: field.divisionId
      };
    });
  } catch (error) {
    console.error('Error fetching matches for division:', field.divisionId, error);
    throw error;
  }
};
