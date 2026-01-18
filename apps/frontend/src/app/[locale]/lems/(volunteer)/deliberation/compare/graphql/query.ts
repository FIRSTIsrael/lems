import { gql, TypedDocumentNode } from '@apollo/client';
import type { UnifiedDivisionData, UnifiedDivisionVars } from './types';

export const GET_UNIFIED_DIVISION: TypedDocumentNode<UnifiedDivisionData, UnifiedDivisionVars> = gql`
  query GetUnifiedDivision($divisionId: String!, $teamSlugs: [String!]) {
    division(id: $divisionId) {
      id
      selectedTeams: teams(slugs: $teamSlugs) {
        id
        number
        name
        slug
        affiliation
        city
        region
        arrived
        disqualified
        logoUrl
        judgingSession {
          id
          room {
            id
            name
          }
        }
        scoresheets(stage: RANKING) {
          id
          round
          slug
          data {
            score
            gp {
              value
              notes
            }
          }
        }
        rubrics {
          innovation_project {
            id
            category
            status
            data {
              fields
              feedback {
                greatJob
                thinkAbout
              }
            }
          }
          robot_design {
            id
            category
            status
            data {
              fields
              feedback {
                greatJob
                thinkAbout
              }
            }
          }
          core_values {
            id
            category
            status
            data {
              fields
              awards
              feedback {
                greatJob
                thinkAbout
              }
            }
          }
        }
      }
      allTeams: teams {
        id
        number
        name
        slug
      }
      judging {
        divisionId
        awards {
          id
          name
          place
        }
      }
    }
  }
`;

export const parseCompareTeamsData = (data: UnifiedDivisionData): UnifiedDivisionData => {
  return data;
};
