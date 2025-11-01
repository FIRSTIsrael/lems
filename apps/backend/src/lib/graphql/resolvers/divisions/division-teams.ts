import { GraphQLFieldResolver } from 'graphql';
import db from '../../../database';

export interface TeamGraphQL {
  id: string;
  number: number;
  name: string;
  affiliation: string;
  city: string;
  location: string | null;
  divisionId: string;
}

interface DivisionWithId {
  id: string;
}

interface TeamsArgs {
  ids?: string[];
}

export const divisionTeamsResolver: GraphQLFieldResolver<
  DivisionWithId,
  unknown,
  TeamsArgs,
  Promise<TeamGraphQL[]>
> = async (division: DivisionWithId, args: TeamsArgs) => {
  try {
    const teams = await db.teams.byDivisionId(division.id).getAll();

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
      location: t.coordinates,
      divisionId: division.id
    }));
  } catch (error) {
    console.error('Error fetching teams for division:', division.id, error);
    throw error;
  }
};
