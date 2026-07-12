import { GraphQLFieldResolver } from 'graphql';
import db from '../../../database';

interface TeamWithDivisionId {
  id: string;
  divisionId: string;
}

/**
 * Resolver for Team.profileDocumentUrl field.
 * Fetches the profile document URL for a team in a specific division from the team_divisions table.
 */
export const teamProfileDocumentUrlResolver: GraphQLFieldResolver<
  TeamWithDivisionId,
  unknown,
  unknown,
  Promise<string | null>
> = async (team: TeamWithDivisionId) => {
  try {
    const teamDivision = await db.raw.sql
      .selectFrom('team_divisions')
      .select('profile_document_url')
      .where('team_id', '=', team.id)
      .where('division_id', '=', team.divisionId)
      .executeTakeFirst();

    return teamDivision?.profile_document_url ?? null;
  } catch (error) {
    console.error('Error fetching profile document URL for team:', team.id, error);
    throw error;
  }
};
