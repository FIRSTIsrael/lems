import { GraphQLFieldResolver } from 'graphql';
import db from '../../database';

export interface RootTeamGraphQL {
  id: string;
  number: number;
  name: string;
  affiliation: string;
  city: string;
  location: string | null;
}

interface TeamsQueryArgs {
  ids?: string[];
  searchTerm?: string;
  limit?: number;
}

export const teamsResolver: GraphQLFieldResolver<
  unknown,
  unknown,
  TeamsQueryArgs,
  Promise<RootTeamGraphQL[]>
> = async (_parent: unknown, args: TeamsQueryArgs) => {
  try {
    let teams;

    if (args.searchTerm) {
      teams = await db.teams.search(args.searchTerm, args.limit || 20);
    } else {
      teams = await db.teams.getAll();
    }

    let filteredTeams = teams;
    if (args.ids && args.ids.length > 0) {
      const idsSet = new Set(args.ids);
      filteredTeams = teams.filter(team => idsSet.has(team.id));
    }

    return filteredTeams.map(t => ({
      id: t.id,
      number: t.number,
      name: t.name,
      affiliation: t.affiliation,
      city: t.city,
      location: t.coordinates
    }));
  } catch (error) {
    console.error('Error fetching teams:', error);
    throw error;
  }
};
