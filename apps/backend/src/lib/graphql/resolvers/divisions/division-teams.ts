import { GraphQLFieldResolver } from 'graphql';
import db from '../../../database';
import { buildTeamGraphQL, TeamGraphQL } from '../../utils/team-builder';

interface DivisionWithId {
  id: string;
}

interface TeamsArgs {
  ids?: string[];
  slugs?: string[];
}

/**
 * Resolver for Division.teams field.
 * Fetches all teams in a division, optionally filtered by IDs or slugs.
 */
export const divisionTeamsResolver: GraphQLFieldResolver<
  DivisionWithId,
  unknown,
  TeamsArgs,
  Promise<TeamGraphQL[]>
> = async (division: DivisionWithId, args: TeamsArgs) => {
  try {
    const idsSet = new Set(args.ids || []);
    const slugsSet = new Set(args.slugs || []);

    let teams = await db.teams.byDivisionId(division.id).getAll();

    // Filter by IDs if provided
    if (idsSet.size > 0) {
      teams = teams.filter(team => idsSet.has(team.id));
    }

    // Filter by slugs if provided
    if (slugsSet.size > 0) {
      teams = teams.filter(team => {
        const teamSlug = `${team.region}-${team.number}`;
        return slugsSet.has(teamSlug);
      });
    }

    return teams.map(team => buildTeamGraphQL(team, division.id));
  } catch (error) {
    console.error('Error fetching teams for division:', division.id, error);
    throw error;
  }
};
