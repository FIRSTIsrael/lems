import { gql, TypedDocumentNode } from '@apollo/client';

export interface Award {
  id: string;
  name: string;
  placeCount: number;
  description: string | null;
}

interface QueryData {
  division?: {
    id: string;
    awards: Array<{
      id: string;
      name: string;
      place: number;
      description: string | null;
    }>;
  } | null;
}

interface QueryVars {
  divisionId: string;
}

export const GET_DIVISION_AWARDS: TypedDocumentNode<QueryData, QueryVars> = gql`
  query GetDivisionAwards($divisionId: String!) {
    division(id: $divisionId) {
      id
      awards {
        id
        name
        place
        description
      }
    }
  }
`;

export function parseDivisionAwards(data: QueryData): Award[] {
  const awards = data.division?.awards ?? [];
  
  // Group by award name and count places
  const awardGroups = awards.reduce((groups, award) => {
    if (!groups[award.name]) {
      groups[award.name] = {
        id: award.id,
        name: award.name,
        placeCount: 0,
        description: award.description,
      };
    }
    groups[award.name].placeCount++;
    return groups;
  }, {} as Record<string, Award>);

  return Object.values(awardGroups);
}