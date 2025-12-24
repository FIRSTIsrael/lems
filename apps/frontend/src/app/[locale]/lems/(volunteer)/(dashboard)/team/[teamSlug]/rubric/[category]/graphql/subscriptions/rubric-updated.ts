import { gql, TypedDocumentNode } from '@apollo/client';
import { merge, updateById, Reconciler, underscoresToHyphens } from '@lems/shared/utils';
import { JudgingCategory } from '@lems/types/judging';
import type { SubscriptionConfig } from '../../../../../../../hooks/use-page-data';
import type { QueryResult } from '../types';
import { getEmptyRubric } from '../../rubric-utils';

type RubricValueUpdatedEvent = {
  __typename: 'RubricValueUpdated';
  rubricId: string;
  fieldId: string;
  value: { value: number; notes?: string };
};

type RubricFeedbackUpdatedEvent = {
  __typename: 'RubricFeedbackUpdated';
  rubricId: string;
  feedback: { greatJob: string; thinkAbout: string };
};

type RubricStatusUpdatedEvent = {
  __typename: 'RubricStatusUpdated';
  rubricId: string;
  status: string;
};

type RubricAwardsUpdatedEvent = {
  __typename: 'RubricAwardsUpdated';
  rubricId: string;
  awards: Record<string, boolean>;
};

type RubricResetEvent = {
  __typename: 'RubricReset';
  rubricId: string;
  reset: boolean;
};

type RubricUpdatedEvent =
  | RubricValueUpdatedEvent
  | RubricFeedbackUpdatedEvent
  | RubricStatusUpdatedEvent
  | RubricAwardsUpdatedEvent
  | RubricResetEvent;

type SubscriptionResult = {
  rubricUpdated: RubricUpdatedEvent;
};

type SubscriptionVariables = {
  divisionId: string;
};

export const RUBRIC_UPDATED_SUBSCRIPTION: TypedDocumentNode<
  SubscriptionResult,
  SubscriptionVariables
> = gql`
  subscription RubricUpdated($divisionId: String!) {
    rubricUpdated(divisionId: $divisionId) {
      __typename
      ... on RubricValueUpdated {
        rubricId
        fieldId
        value {
          value
          notes
        }
      }
      ... on RubricFeedbackUpdated {
        rubricId
        feedback {
          greatJob
          thinkAbout
        }
      }
      ... on RubricStatusUpdated {
        rubricId
        status
      }
      ... on RubricAwardsUpdated {
        rubricId
        awards
      }
      ... on RubricReset {
        rubricId
        reset
      }
    }
  }
`;

const rubricUpdatedReconciler: Reconciler<QueryResult, SubscriptionResult> = (prev, { data }) => {
  if (!data?.rubricUpdated) {
    return prev;
  }

  const event = data.rubricUpdated;
  const { rubricId } = event;

  return merge(prev, {
    division: {
      judging: {
        rubrics: updateById(prev.division.judging.rubrics, rubricId, rubric => {
          if (event.__typename === 'RubricValueUpdated') {
            return merge(rubric, {
              data: merge(
                rubric.data ||
                  getEmptyRubric(underscoresToHyphens(rubric.category) as JudgingCategory),
                {
                  fields: {
                    ...(rubric.data?.fields || {}),
                    [event.fieldId]: event.value
                  }
                }
              )
            });
          }

          if (event.__typename === 'RubricFeedbackUpdated') {
            return merge(rubric, {
              data: merge(
                rubric.data ||
                  getEmptyRubric(underscoresToHyphens(rubric.category) as JudgingCategory),
                {
                  feedback: event.feedback
                }
              )
            });
          }

          if (event.__typename === 'RubricStatusUpdated') {
            return merge(rubric, {
              status: event.status
            });
          }

          if (event.__typename === 'RubricAwardsUpdated') {
            return merge(rubric, {
              data: merge(
                rubric.data ||
                  getEmptyRubric(underscoresToHyphens(rubric.category) as JudgingCategory),
                {
                  awards: event.awards
                }
              )
            });
          }

          if (event.__typename === 'RubricReset') {
            if (!event.reset) return rubric;

            return merge(rubric, {
              data: null
            });
          }

          return rubric;
        })
      }
    }
  });
};

export function createRubricUpdatedSubscription(
  divisionId: string
): SubscriptionConfig<unknown, QueryResult, SubscriptionVariables> {
  return {
    subscription: RUBRIC_UPDATED_SUBSCRIPTION,
    subscriptionVariables: {
      divisionId
    },
    updateQuery: rubricUpdatedReconciler as (
      prev: QueryResult,
      subscriptionData: { data?: unknown }
    ) => QueryResult
  };
}
