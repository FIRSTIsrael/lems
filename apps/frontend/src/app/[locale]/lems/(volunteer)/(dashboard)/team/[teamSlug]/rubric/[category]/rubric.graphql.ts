import { gql, TypedDocumentNode } from '@apollo/client';
import type { ApolloCache } from '@apollo/client';
import { merge, updateById, Reconciler } from '@lems/shared/utils';
import { JudgingCategory } from '@lems/types/judging';
import { RubricStatus } from '@lems/database';
import type { SubscriptionConfig } from '../../../../../hooks/use-page-data';

/**
 * Query to fetch a single rubric for a team and category
 */
export const GET_RUBRIC_QUERY: TypedDocumentNode<RubricQueryResult, GetRubricQueryVariables> = gql`
  query GetRubric($divisionId: String!, $teamId: String!, $category: JudgingCategory!) {
    division(id: $divisionId) {
      id
      judging {
        rubrics(teamIds: [$teamId], category: $category) {
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
    }
  }
`;

/**
 * Mutation to update a single rubric field value
 */
export const UPDATE_RUBRIC_VALUE_MUTATION: TypedDocumentNode<
  UpdateRubricValueMutationResult,
  UpdateRubricValueMutationVariables
> = gql`
  mutation UpdateRubricValue(
    $divisionId: String!
    $rubricId: String!
    $fieldId: String!
    $value: Int!
    $notes: String
  ) {
    updateRubricValue(
      divisionId: $divisionId
      rubricId: $rubricId
      fieldId: $fieldId
      value: $value
      notes: $notes
    ) {
      rubricId
      fieldId
      value {
        value
        notes
      }
      version
    }
  }
`;

/**
 * Mutation to update feedback in a rubric
 */
export const UPDATE_RUBRIC_FEEDBACK_MUTATION: TypedDocumentNode<
  UpdateRubricFeedbackMutationResult,
  UpdateRubricFeedbackMutationVariables
> = gql`
  mutation UpdateRubricFeedback(
    $divisionId: String!
    $rubricId: String!
    $greatJob: String!
    $thinkAbout: String!
  ) {
    updateRubricFeedback(
      divisionId: $divisionId
      rubricId: $rubricId
      greatJob: $greatJob
      thinkAbout: $thinkAbout
    ) {
      rubricId
      feedback {
        greatJob
        thinkAbout
      }
      version
    }
  }
`;

/**
 * Mutation to update the status of a rubric
 */
export const UPDATE_RUBRIC_STATUS_MUTATION: TypedDocumentNode<
  UpdateRubricStatusMutationResult,
  UpdateRubricStatusMutationVariables
> = gql`
  mutation UpdateRubricStatus($divisionId: String!, $rubricId: String!, $status: RubricStatus!) {
    updateRubricStatus(divisionId: $divisionId, rubricId: $rubricId, status: $status) {
      rubricId
      status
      version
    }
  }
`;

/**
 * Subscription to real-time rubric updates
 * Fires whenever any field value, feedback, or status is updated in a rubric in the division
 * Returns RubricValueUpdated, RubricFeedbackUpdated, or RubricStatusUpdated
 */
export const RUBRIC_UPDATED_SUBSCRIPTION: TypedDocumentNode<
  RubricUpdatedSubscriptionResult,
  RubricUpdatedSubscriptionVariables
> = gql`
  subscription RubricUpdated($divisionId: String!, $lastSeenVersion: Int) {
    rubricUpdated(divisionId: $divisionId, lastSeenVersion: $lastSeenVersion) {
      __typename
      ... on RubricValueUpdated {
        rubricId
        fieldId
        value {
          value
          notes
        }
        version
      }
      ... on RubricFeedbackUpdated {
        rubricId
        feedback {
          greatJob
          thinkAbout
        }
        version
      }
      ... on RubricStatusUpdated {
        rubricId
        status
        version
      }
    }
  }
`;

// ============ Type Definitions ============

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

export interface RubricItem {
  id: string;
  team: RubricTeamData;
  category: JudgingCategory;
  status: RubricStatus;
  data?: RubricDataFields;
}

export interface RubricQueryResult {
  division: {
    judging: {
      rubrics: RubricItem[];
    };
  };
}

export interface GetRubricQueryVariables {
  divisionId: string;
  teamId: string;
  category: JudgingCategory;
}

export interface UpdateRubricValueMutationResult {
  updateRubricValue: {
    rubricId: string;
    fieldId: string;
    value: {
      value: number;
      notes?: string;
    };
    version: number;
  };
}

export interface UpdateRubricValueMutationVariables {
  divisionId: string;
  rubricId: string;
  fieldId: string;
  value: number;
  notes?: string;
}

export interface UpdateRubricFeedbackMutationResult {
  updateRubricFeedback: {
    rubricId: string;
    feedback: {
      greatJob: string;
      thinkAbout: string;
    };
    version: number;
  };
}

export interface UpdateRubricFeedbackMutationVariables {
  divisionId: string;
  rubricId: string;
  greatJob: string;
  thinkAbout: string;
}

export interface UpdateRubricStatusMutationResult {
  updateRubricStatus: {
    rubricId: string;
    status: RubricStatus;
    version: number;
  };
}

export interface UpdateRubricStatusMutationVariables {
  divisionId: string;
  rubricId: string;
  status: RubricStatus;
}

export type RubricUpdatedEvent =
  | {
      __typename: 'RubricValueUpdated';
      rubricId: string;
      fieldId: string;
      value: {
        value: number;
        notes?: string;
      };
      version: number;
    }
  | {
      __typename: 'RubricFeedbackUpdated';
      rubricId: string;
      feedback: {
        greatJob: string;
        thinkAbout: string;
      };
      version: number;
    }
  | {
      __typename: 'RubricStatusUpdated';
      rubricId: string;
      status: RubricStatus;
      version: number;
    };

export interface RubricUpdatedSubscriptionResult {
  rubricUpdated: RubricUpdatedEvent;
}

export interface RubricUpdatedSubscriptionVariables {
  divisionId: string;
  lastSeenVersion?: number;
}

// ============ Parser Functions ============

/**
 * Parses the query result to extract the first rubric
 *
 * @param queryData - The query result from GetRubric
 * @returns The first rubric item or undefined
 */
/**
 * Parses the query result to extract the first rubric
 * If the rubric has no data, creates a minimal empty data structure
 *
 * @param queryData - The query result from GetRubric
 * @returns The first rubric item with populated data, or undefined if no rubric found
 */
export function parseRubricData(queryData: RubricQueryResult): RubricItem | undefined {
  const rubric = queryData.division?.judging?.rubrics?.[0];

  if (!rubric) {
    return undefined;
  }

  // If rubric exists but has no data, populate with minimal empty data structure
  if (!rubric.data) {
    const emptyData: RubricDataFields = {
      values: {},
      feedback: {
        greatJob: '',
        thinkAbout: ''
      }
    };

    return {
      ...rubric,
      data: emptyData
    };
  }

  return rubric;
}

// ============ Cache Update Functions ============

/**
 * Reconciler for rubric updates (both field and feedback).
 * Handles both RubricValueUpdated and RubricFeedbackUpdated event types.
 */
const rubricUpdatedReconciler: Reconciler<RubricQueryResult, RubricUpdatedSubscriptionResult> = (
  prev,
  { data }
) => {
  if (!data?.rubricUpdated) {
    return prev;
  }

  const rubricUpdatedEvent = data.rubricUpdated;
  const { rubricId } = rubricUpdatedEvent;
  const rubrics = prev.division.judging.rubrics;

  // Find the rubric that was updated
  const rubricIndex = rubrics.findIndex(r => r.id === rubricId);
  if (rubricIndex === -1) {
    return prev;
  }

  // Update based on event type
  const updatedRubrics = [...rubrics];
  const rubricData = (updatedRubrics[rubricIndex].data || {}) as RubricDataFields;

  if (rubricUpdatedEvent.__typename === 'RubricValueUpdated') {
    // Field value update
    const { fieldId, value } = rubricUpdatedEvent;
    updatedRubrics[rubricIndex].data = merge(rubricData, {
      values: {
        ...(rubricData.values || {}),
        [fieldId]: value
      }
    });
  } else if (rubricUpdatedEvent.__typename === 'RubricFeedbackUpdated') {
    // Feedback update
    const { feedback } = rubricUpdatedEvent;
    updatedRubrics[rubricIndex].data = merge(rubricData, {
      feedback
    });
  } else if (rubricUpdatedEvent.__typename === 'RubricStatusUpdated') {
    // Status update
    const { status } = rubricUpdatedEvent;
    updatedRubrics[rubricIndex] = merge(updatedRubrics[rubricIndex], { status });
  }

  return merge(prev, {
    division: {
      judging: {
        rubrics: updatedRubrics
      }
    }
  });
};

/**
 * Creates an Apollo cache update function for the rubric field value mutation.
 * Optimistically updates the cache to reflect the new field value.
 *
 * @param rubricId - The ID of the rubric being updated
 * @param fieldId - The ID of the field being updated
 * @param fieldValue - The new field value (includes value and optional notes)
 * @returns Cache update function for Apollo useMutation
 */
export function createUpdateRubricValueCacheUpdate(
  rubricId: string,
  fieldId: string,
  fieldValue: { value: number; notes?: string }
) {
  return (cache: ApolloCache) => {
    cache.modify({
      fields: {
        division(existingDivision = {}) {
          const division = existingDivision as {
            judging?: { rubrics?: RubricItem[] };
          };
          if (!division.judging?.rubrics) {
            return existingDivision;
          }

          return merge(existingDivision, {
            judging: {
              rubrics: updateById(division.judging.rubrics, rubricId, rubric =>
                merge(rubric, {
                  data: merge(rubric.data || {}, {
                    values: {
                      ...(rubric.data?.values || {}),
                      [fieldId]: fieldValue
                    }
                  })
                })
              )
            }
          });
        }
      }
    });
  };
}

/**
 * Creates an Apollo cache update function for the rubric feedback mutation.
 * Optimistically updates the cache to reflect new feedback.
 *
 * @param rubricId - The ID of the rubric being updated
 * @param feedback - The new feedback data
 * @returns Cache update function for Apollo useMutation
 */
export function createUpdateRubricFeedbackCacheUpdate(
  rubricId: string,
  feedback: { greatJob: string; thinkAbout: string }
) {
  return (cache: ApolloCache) => {
    cache.modify({
      fields: {
        division(existingDivision = {}) {
          const division = existingDivision as {
            judging?: { rubrics?: RubricItem[] };
          };
          if (!division.judging?.rubrics) {
            return existingDivision;
          }

          return merge(existingDivision, {
            judging: {
              rubrics: updateById(division.judging.rubrics, rubricId, rubric =>
                merge(rubric, {
                  data: merge(rubric.data || {}, {
                    feedback
                  })
                })
              )
            }
          });
        }
      }
    });
  };
}

/**
 * Creates an Apollo cache update function for the rubric status mutation.
 * Optimistically updates the cache to reflect the new status.
 *
 * @param rubricId - The ID of the rubric being updated
 * @param status - The new status
 * @returns Cache update function for Apollo useMutation
 */
export function createUpdateRubricStatusCacheUpdate(rubricId: string, status: RubricStatus) {
  return (cache: ApolloCache) => {
    cache.modify({
      fields: {
        division(existingDivision = {}) {
          const division = existingDivision as {
            judging?: { rubrics?: RubricItem[] };
          };
          if (!division.judging?.rubrics) {
            return existingDivision;
          }

          return merge(existingDivision, {
            judging: {
              rubrics: updateById(division.judging.rubrics, rubricId, rubric =>
                merge(rubric, { status })
              )
            }
          });
        }
      }
    });
  };
}

// ============ Subscription Config Factories ============

/**
 * Creates a subscription configuration for rubric updates.
 * Fires when any field value or feedback is updated in a rubric in the division.
 * Handles both RubricValueUpdated and RubricFeedbackUpdated event types.
 *
 * @param divisionId - The division ID to subscribe to
 * @returns Subscription configuration for use with usePageData hook
 */
export function createRubricUpdatedSubscription(
  divisionId: string
): SubscriptionConfig<unknown, RubricQueryResult, RubricUpdatedSubscriptionVariables> {
  return {
    subscription: RUBRIC_UPDATED_SUBSCRIPTION,
    subscriptionVariables: {
      divisionId
    },
    updateQuery: rubricUpdatedReconciler as (
      prev: RubricQueryResult,
      subscriptionData: { data?: unknown }
    ) => RubricQueryResult
  } as SubscriptionConfig<unknown, RubricQueryResult, RubricUpdatedSubscriptionVariables>;
}
