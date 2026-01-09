import { gql, type TypedDocumentNode } from '@apollo/client';
import type { QueryData, QueryVars, Award } from './types';

export const GET_DIVISION_AWARDS: TypedDocumentNode<QueryData, QueryVars> = gql`
  query GetDivisionAwards($divisionId: String!) {
    division(id: $divisionId) {
      id
      judging {
        awards {
          id
          name
          place
          description
        }
      }
    }
  }
`;

export function parseDivisionAwards(data: QueryData): Award[] {
  const awards = data.division?.awards ?? [];

  // Group by award name and count places
  const awardGroups = awards.reduce(
    (groups, award) => {
      if (!groups[award.name]) {
        groups[award.name] = {
          id: award.id,
          name: award.name,
          placeCount: 0,
          description: award.description
        };
      }
      groups[award.name].placeCount++;
      return groups;
    },
    {} as Record<string, Award>
  );

  return Object.values(awardGroups);
}

export type { QueryData, QueryVars };
