import { GraphQLFieldResolver } from 'graphql';
import db from '../../../database';

interface TeamWithDivisionId {
  id: string;
  divisionId: string;
}

/**
 * Resolver for Team.arrived field.
 * Fetches whether a team has arrived in a specific division.
 */
export const teamArrivalResolver: GraphQLFieldResolver<
  TeamWithDivisionId,
  unknown,
  unknown,
  Promise<boolean>
> = async (team: TeamWithDivisionId) => {
  try {
    const teamDivision = await db.raw.sql
      .selectFrom('team_divisions')
      .select('arrived')
      .where('team_id', '=', team.id)
      .where('division_id', '=', team.divisionId)
      .executeTakeFirst();

    return teamDivision?.arrived ?? false;
  } catch (error) {
    console.error('Error fetching team arrival status for team:', team.id, error);
    throw error;
  }
};
