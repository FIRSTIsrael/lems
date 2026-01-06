import { gql, TypedDocumentNode } from '@apollo/client';
import type { FinalDeliberationData, FinalDeliberationVars } from './types';

export const GET_FINAL_DELIBERATION: TypedDocumentNode<
  FinalDeliberationData,
  FinalDeliberationVars
> = gql`
  query GetFinalDeliberation($divisionId: String!) {
    division(id: $divisionId) {
      id
      name
      color

      teams {
        id
        number
        name
        affiliation
        city
        region
        arrived
        disqualified
        slug
        judgingSession {
          id
          status
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

      judging {
        divisionId
        finalDeliberation {
          divisionId
          stage
          status
          startTime
          completionTime
          champions
          robotPerformance
          innovationProject
          robotDesign
          coreValues
          optionalAwards
          coreAwardsManualEligibility
          optionalAwardsManualEligibility
        }
      }
    }
  }
`;

export function parseFinalDeliberationData(data: FinalDeliberationData) {
  return data.division;
}
