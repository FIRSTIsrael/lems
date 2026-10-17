import { GraphQLFieldResolver } from 'graphql';
import db from '../../../../database';

interface FieldWithDivisionId {
  divisionId: string;
}

/**
 * Resolver for Field.rankingRoundCount field.
 * Returns the number of RANKING-stage rounds configured for the division, so clients can
 * pad/compare robot game scores without inferring the round count from submitted scoresheets.
 */
export const rankingRoundCountResolver: GraphQLFieldResolver<
  FieldWithDivisionId,
  unknown,
  unknown,
  Promise<number>
> = async (field: FieldWithDivisionId) => {
  try {
    return await db.robotGameMatches.byDivision(field.divisionId).getRankingRoundCount();
  } catch (error) {
    console.error('Error fetching ranking round count for division:', field.divisionId, error);
    throw error;
  }
};
