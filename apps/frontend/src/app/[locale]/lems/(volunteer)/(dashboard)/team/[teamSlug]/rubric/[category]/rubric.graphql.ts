import { gql } from '@apollo/client';
import { JudgingCategory } from '@lems/types/judging';
import { RubricStatus } from '@lems/database';

/**
 * Query to fetch a single rubric for a team and category
 */
export const GET_RUBRIC_QUERY = gql`
  query GetRubric($teamId: String!, $category: JudgingCategory!) {
    rubric(teamId: $teamId, category: $category) {
      id
      team {
        id
        name
        number
      }
      category
      status
      data {
        awards
        values
        feedback {
          greatJob
          thinkAbout
        }
      }
    }
  }
`;

export interface RubricTeamData {
  id: string;
  name: string;
  number: number;
}

export interface RubricFeedbackData {
  greatJob: string;
  thinkAbout: string;
}

export interface RubricDataFields {
  awards?: Record<string, unknown>;
  values: Record<string, unknown>;
  feedback: RubricFeedbackData;
}

export interface RubricQueryResult {
  rubric: {
    id: string;
    team: RubricTeamData;
    category: JudgingCategory;
    status: RubricStatus;
    data?: RubricDataFields;
  };
}

export interface GetRubricQueryVariables {
  teamId: string;
  category: JudgingCategory;
}
