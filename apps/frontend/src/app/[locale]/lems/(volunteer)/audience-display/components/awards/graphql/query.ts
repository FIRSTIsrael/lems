import { gql, TypedDocumentNode } from '@apollo/client';
import { AwardsData, AwardsVars } from './types';

export const GET_AWARDS_DATA: TypedDocumentNode<AwardsData, AwardsVars> = gql`
  query GetAwardsData($divisionId: String!) {
    division(id: $divisionId) {
      id
      field {
        judging {
          awards {
            id
            name
            index
            place
            type
            isOptional
            winner {
              ... on TeamWinner {
                id
                name
                number
                affiliation {
                  id
                  name
                  city
                }
              }
              ... on PersonalWinner {
                id
                name
                team {
                  id
                  number
                  name
                }
              }
            }
          }
        }
      }
    }
  }
`;

export function parseAwardsData(data: AwardsData) {
  return data.division.field.judging?.awards ?? [];
}
