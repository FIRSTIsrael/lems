import { gql, TypedDocumentNode } from '@apollo/client';
import type { CompareTeamsData, CompareTeamsVars, DivisionTeamsData, DivisionTeamsVars } from './types';

export const GET_DIVISION_TEAMS: TypedDocumentNode<DivisionTeamsData, DivisionTeamsVars> = gql`
  query GetDivisionTeams($divisionId: String!) {
    division(id: $divisionId) {
      id
      teams {
        id
        number
        name
        slug
      }
    }
  }
`;

export const GET_COMPARE_TEAMS: TypedDocumentNode<CompareTeamsData, CompareTeamsVars> = gql`
  query GetCompareTeams($teamSlugs: [String!]!, $divisionId: String!) {
    division(id: $divisionId) {
      id
      teams(slugs: $teamSlugs) {
        id
        number
        name
        affiliation
        city
        region
        arrived
        disqualified
        slug
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
      awards {
        id
        name
        place
      }
    }
  } 
`;
