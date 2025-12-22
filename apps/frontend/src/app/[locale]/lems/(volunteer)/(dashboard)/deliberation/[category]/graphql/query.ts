import { gql, TypedDocumentNode } from '@apollo/client';
import type { CategoryDeliberationData, CategoryDeliberationVars } from './types';

export const GET_CATEGORY_DELIBERATION: TypedDocumentNode<
  CategoryDeliberationData,
  CategoryDeliberationVars
> = gql`
  query GetCategoryDeliberation($divisionId: String!, $category: JudgingCategory!) {
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
        deliberation(category: $category) {
          id
          category
          status
          startTime
          picklist
        }
      }
    }
  }
`;

export function parseCategoryDeliberationData(data: CategoryDeliberationData) {
  return data.division;
}
