import { gql, TypedDocumentNode } from '@apollo/client';
import { merge } from '@lems/shared/utils';
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
        awards {
          id
          name
          index
          place
          type
          isOptional
          allowNominations
          automaticAssignment
          showPlaces
          winner {
            ... on TeamWinner {
              team {
                id
                name
                number
                slug
              }
            }
            ... on PersonalWinner {
              name
            }
          }
        }

        innovationProjectDeliberation: deliberation(category: innovation_project) {
          picklist
        }

        robotDesignDeliberation: deliberation(category: robot_design) {
          picklist
        }

        coreValuesDeliberation: deliberation(category: core_values) {
          picklist
        }

        finalDeliberation {
          divisionId
          stage
          status
          startTime
          completionTime
          champions
          innovationProject
          robotDesign
          coreValues
          optionalAwards
          robotPerformance
          coreAwardsManualEligibility
          optionalAwardsManualEligibility
        }
        advancementPercentage
      }
    }
  }
`;

export function parseFinalDeliberationData(data: FinalDeliberationData) {
  const updates: Record<string, unknown> = {};

  if (typeof data.division.judging.finalDeliberation.champions === 'string') {
    updates.champions = JSON.parse(data.division.judging.finalDeliberation.champions);
  }
  if (typeof data.division.judging.finalDeliberation.optionalAwards === 'string') {
    updates.optionalAwards = JSON.parse(data.division.judging.finalDeliberation.optionalAwards);
  }

  if (Object.keys(updates).length > 0) {
    return merge(data, {
      division: { judging: { finalDeliberation: updates } }
    }).division;
  }
  return data.division;
}
