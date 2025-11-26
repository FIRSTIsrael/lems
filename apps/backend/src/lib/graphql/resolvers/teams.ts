import { GraphQLFieldResolver } from 'graphql';
import { Team as DbTeam } from '@lems/database';
import db from '../../database';

export interface RootTeamGraphQL {
  id: string;
  number: number;
  name: string;
  affiliation: string;
  city: string;
  location: string | null;
  region: string;
  slug: string;
  logoUrl: string | null;
}

interface TeamsQueryArgs {
  ids?: string[];
  searchTerm?: string;
  limit?: number;
}

/**
 * Query resolver for teams.
 * Supports search by term with optional ID filtering.
 * @param searchTerm - Optional text to search in team name, affiliation, etc.
 * @param ids - Optional array of team IDs to filter results
 * @param limit - Optional result limit (default: 20 for search, unlimited for all)
 */
export const teamsResolver: GraphQLFieldResolver<
  unknown,
  unknown,
  TeamsQueryArgs,
  Promise<RootTeamGraphQL[]>
> = async (_parent: unknown, args: TeamsQueryArgs) => {
  try {
    const teams = args.searchTerm
      ? await db.teams.search(args.searchTerm, args.limit || 20)
      : await db.teams.getAll();

    // Filter by IDs if provided
    if (!args.ids || args.ids.length === 0) {
      return teams.map(buildResult);
    }

    const idsSet = new Set(args.ids);
    return teams.filter(team => idsSet.has(team.id)).map(buildResult);
  } catch (error) {
    console.error('Error fetching teams:', error);
    throw error;
  }
};

/**
 * Maps database Team to GraphQL RootTeamGraphQL type.
 */
function buildResult(team: DbTeam): RootTeamGraphQL {
  return {
    id: team.id,
    number: team.number,
    name: team.name,
    affiliation: team.affiliation,
    city: team.city,
    location: team.coordinates,
    region: team.region,
    slug: `${team.region}-${team.number}`,
    logoUrl: team.logo_url || null
  };
}
