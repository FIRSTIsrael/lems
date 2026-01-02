import { GraphQLFieldResolver } from 'graphql';
import db from '../../../database';

interface TeamWithDivisionId {
  id: string;
  divisionId: string;
}

/**
 * Resolver for Team.disqualified field.
 * Checks if the team has been disqualified in this division.
 */
export const teamDisqualifiedResolver: GraphQLFieldResolver<
  TeamWithDivisionId,
  unknown,
  unknown,
  Promise<boolean>
> = async (team: TeamWithDivisionId) => {
  try {
    const teamDivision = await db.raw.sql
      .selectFrom('team_divisions')
      .select('disqualified')
      .where('team_id', '=', team.id)
      .where('division_id', '=', team.divisionId)
      .executeTakeFirst();

    return teamDivision?.disqualified ?? false;
  } catch (error) {
    console.error('Error fetching disqualified status for team:', team.id, error);
    throw error;
  }
};
