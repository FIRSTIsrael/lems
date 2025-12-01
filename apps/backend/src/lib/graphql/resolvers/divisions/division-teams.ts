import { GraphQLFieldResolver } from 'graphql';
import { Team as DbTeam } from '@lems/database';
import db from '../../../database';

export interface TeamGraphQL {
  id: string;
  number: number;
  name: string;
  affiliation: string;
  city: string;
  region: string;
  location: string | null;
  divisionId: string;
  slug: string;
  logoUrl: string | null;
}

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

    return teams.map(buildResult(division.id));
  } catch (error) {
    console.error('Error fetching teams for division:', division.id, error);
    throw error;
  }
};

/**
 * Maps a database Team to GraphQL TeamGraphQL, binding to a division.
 */
function buildResult(divisionId: string) {
  return (team: DbTeam): TeamGraphQL => ({
    id: team.id,
    number: team.number,
    name: team.name,
    affiliation: team.affiliation,
    city: team.city,
    region: team.region,
    location: team.coordinates,
    slug: `${team.region}-${team.number}`.toUpperCase(),
    logoUrl: team.logo_url || null,
    divisionId
  });
}
