import { Team } from '../team-list.graphql';

export type SortField = 'number' | 'name' | 'affiliation' | 'city' | 'arrived';
export type SortDirection = 'asc' | 'desc';

function compareTeams(a: Team, b: Team, field: SortField): number {
  switch (field) {
    case 'number':
      return a.number - b.number;
    case 'name':
      return a.name.localeCompare(b.name);
    case 'affiliation':
      return a.affiliation.localeCompare(b.affiliation);
    case 'city':
      return a.city.localeCompare(b.city);
    case 'arrived':
      // Sort arrived teams last (false > true in sorting)
      return Number(b.arrived) - Number(a.arrived);
    default:
      return 0;
  }
}

export function sortTeams(teams: Team[], sortBy: SortField, direction: SortDirection): Team[] {
  const sorted = [...teams].sort((a, b) => {
    const comparison = compareTeams(a, b, sortBy);
    return direction === 'desc' ? -comparison : comparison;
  });
  return sorted;
}

export function getNextSortDirection(
  currentField: SortField,
  currentDirection: SortDirection,
  clickedField: SortField
): SortDirection {
  if (currentField === clickedField) {
    return currentDirection === 'asc' ? 'desc' : 'asc';
  }
  return 'asc';
}
