import { GraphQLFieldResolver } from 'graphql';
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
  round?: number;
  teamIds?: string[];
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

    // Filter by round if provided
    if (args.round !== undefined) {
      matches = matches.filter(match => match.round === args.round);
    }

    // Filter by team IDs if provided
    if (args.teamIds && args.teamIds.length > 0) {
      const teamIdsSet = new Set(args.teamIds);
      matches = matches.filter(match =>
        match.participants.some(p => p.team_id != null && teamIdsSet.has(p.team_id))
      );
    }

    // Build result with combined data
    return matches.map(match => {
      const slug = `R${match.round}M${match.number}`;

      return {
        id: match.id,
        slug,
        stage: match.stage,
        round: match.round,
        number: match.number,
        scheduledTime: match.scheduled_time.toISOString(),
        status: match.status,
        called: !!match.called,
        startTime: match.start_time ? match.start_time.toISOString() : undefined,
        startDelta: match.start_delta ?? undefined,
        divisionId: field.divisionId
      };
    });
  } catch (error) {
    console.error('Error fetching matches for division:', field.divisionId, error);
    throw error;
  }
};
