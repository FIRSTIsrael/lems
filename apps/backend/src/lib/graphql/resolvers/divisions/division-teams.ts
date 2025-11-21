import { GraphQLFieldResolver } from 'graphql';
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
}

interface DivisionWithId {
  id: string;
}

interface TeamsArgs {
  ids?: string[];
}

/**
 * Resolver for Division.teams field.
 * Fetches all teams in a division, optionally filtered by IDs.
 */
export const divisionTeamsResolver: GraphQLFieldResolver<
  DivisionWithId,
  unknown,
  TeamsArgs,
  Promise<TeamGraphQL[]>
> = async (division: DivisionWithId, args: TeamsArgs) => {
  try {
    const teams = await db.teams.byDivisionId(division.id).getAll();

    // Filter by IDs if provided
    if (!args.ids || args.ids.length === 0) {
      return teams.map(buildResult(division.id));
    }

    const idsSet = new Set(args.ids);
    return teams.filter(team => idsSet.has(team.id)).map(buildResult(division.id));
  } catch (error) {
    console.error('Error fetching teams for division:', division.id, error);
    throw error;
  }
};

/**
 * Maps a database Team to GraphQL TeamGraphQL, binding to a division.
 */
function buildResult(divisionId: string) {
  return (team: {
    id: string;
    number: number;
    name: string;
    affiliation: string;
    city: string;
    region: string;
    coordinates: string | null;
  }) => ({
    id: team.id,
    number: team.number,
    name: team.name,
    affiliation: team.affiliation,
    city: team.city,
    region: team.region,
    location: team.coordinates,
    divisionId
  });
}
