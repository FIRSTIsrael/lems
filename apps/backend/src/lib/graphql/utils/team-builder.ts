import { Team as DbTeam } from '@lems/database';

/**
 * GraphQL Team type used when accessed through a division context.
 * Includes division-scoped fields like arrived status.
 */
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

/**
 * Builds a TeamGraphQL object from a database team with division context.
 * @param team - The database team object
 * @param divisionId - The ID of the division context
 * @returns TeamGraphQL object
 */
export function buildTeamGraphQL(team: DbTeam, divisionId: string): TeamGraphQL {
  return {
    id: team.id,
    number: team.number,
    name: team.name,
    affiliation: team.affiliation,
    city: team.city,
    region: team.region,
    location: team.coordinates || null,
    slug: `${team.region}-${team.number}`.toUpperCase(),
    logoUrl: team.logo_url || null,
    divisionId
  };
}
