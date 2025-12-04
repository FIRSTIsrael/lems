import { gql, TypedDocumentNode } from '@apollo/client';
import type { ApolloCache } from '@apollo/client';
import { merge, updateById, Reconciler, underscoresToHyphens } from '@lems/shared/utils';
import { JudgingCategory } from '@lems/types/judging';
import type { SubscriptionConfig } from '../../../../../hooks/use-page-data';
import { getEmptyRubric } from './rubric-utils';
import { RubricItem } from './types';

type QueryResult = {
  division: {
    judging: {
      rubrics: RubricItem[];
    };
  };
};

type AwardOptionsQueryResult = {
  division: {
    awards: Array<{
      id: string;
      name: string;
    }>;
  };
};

type AwardOptionsQueryVariables = {
  divisionId: string;
};

type QueryVariables = {
  divisionId: string;
  teamId: string;
  category: 'innovation_project' | 'robot_design' | 'core_values';
};

type ValueMutationResult = {
  updateRubricValue: {
    rubricId: string;
    fieldId: string;
    value: { value: number; notes?: string };
    version: number;
  };
};

type ValueMutationVariables = {
  divisionId: string;
  rubricId: string;
  fieldId: string;
  value: number;
  notes?: string;
};

type FeedbackMutationResult = {
  updateRubricFeedback: {
    rubricId: string;
    feedback: { greatJob: string; thinkAbout: string };
    version: number;
  };
};

type FeedbackMutationVariables = {
  divisionId: string;
  rubricId: string;
  greatJob: string;
  thinkAbout: string;
};

type AwardsMutationResult = {
  updateRubricAwards: {
    rubricId: string;
    awards: Record<string, boolean>;
    version: number;
  };
};

type AwardsMutationVariables = {
  divisionId: string;
  rubricId: string;
  awards: Record<string, boolean>;
};

type RubricValueUpdatedEvent = {
  __typename: 'RubricValueUpdated';
  rubricId: string;
  fieldId: string;
  value: { value: number; notes?: string };
  version: number;
};

type RubricFeedbackUpdatedEvent = {
  __typename: 'RubricFeedbackUpdated';
  rubricId: string;
  feedback: { greatJob: string; thinkAbout: string };
  version: number;
};

type RubricStatusUpdatedEvent = {
  __typename: 'RubricStatusUpdated';
  rubricId: string;
  status: string;
  version: number;
};

type RubricAwardsUpdatedEvent = {
  __typename: 'RubricAwardsUpdated';
  rubricId: string;
  awards: Record<string, boolean>;
  version: number;
};

type RubricUpdatedEvent =
  | RubricValueUpdatedEvent
  | RubricFeedbackUpdatedEvent
  | RubricStatusUpdatedEvent
  | RubricAwardsUpdatedEvent;

type SubscriptionResult = {
  rubricUpdated: RubricUpdatedEvent;
};

type SubscriptionVariables = {
  divisionId: string;
  lastSeenVersion?: number;
};

/**
 * Query to fetch a single rubric for a team and category
 */
export const GET_RUBRIC_QUERY: TypedDocumentNode<QueryResult, QueryVariables> = gql`
  query GetRubric($divisionId: String!, $teamId: String!, $category: JudgingCategory!) {
    division(id: $divisionId) {
      id
      judging {
        rubrics(teamIds: [$teamId], category: $category) {
          id
          category
          status
          data {
            awards
            fields
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
 * Query to fetch award options that allow nominations for a division
 */
export const GET_AWARD_OPTIONS_QUERY: TypedDocumentNode<
  AwardOptionsQueryResult,
  AwardOptionsQueryVariables
> = gql`
  query GetAwardOptions($divisionId: String!) {
    division(id: $divisionId) {
      id
      awards(allowNominations: true) {
        id
        name
      }
    }
  }
`;

/**
 * Mutation to update a single rubric field value
 */
export const UPDATE_RUBRIC_VALUE_MUTATION: TypedDocumentNode<
  ValueMutationResult,
  ValueMutationVariables
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
  FeedbackMutationResult,
  FeedbackMutationVariables
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
 * Mutation to update award nominations in a rubric
 */
export const UPDATE_RUBRIC_AWARDS_MUTATION: TypedDocumentNode<
  AwardsMutationResult,
  AwardsMutationVariables
> = gql`
  mutation UpdateRubricAwards($divisionId: String!, $rubricId: String!, $awards: JSON!) {
    updateRubricAwards(divisionId: $divisionId, rubricId: $rubricId, awards: $awards) {
      rubricId
      awards
      version
    }
  }
`;

/**
 * Subscription to real-time rubric updates
 * Fires when any field value, feedback, awards, or status changes
 */
export const RUBRIC_UPDATED_SUBSCRIPTION: TypedDocumentNode<
  SubscriptionResult,
  SubscriptionVariables
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
      ... on RubricAwardsUpdated {
        rubricId
        awards
        version
      }
    }
  }
`;

/**
 * Parses the query result to extract the first rubric.
 * If the rubric has no data, creates an empty rubric.
 */
export function parseRubricData(queryData: QueryResult): RubricItem {
  const rubric = queryData.division?.judging?.rubrics?.[0];

  if (!rubric.data) {
    return {
      ...rubric,
      data: getEmptyRubric(underscoresToHyphens(rubric.category) as JudgingCategory)
    };
  }

  return rubric;
}

/**
 * Parses the award options query result and returns a Set of award names.
 */
export function parseAwardOptions(queryData: AwardOptionsQueryResult): Set<string> {
  const awards = queryData.division?.awards ?? [];
  return new Set(awards.map(award => award.name));
}

/**
 * Creates an Apollo cache update function for the rubric field value mutation.
 * Optimistically updates the cache to reflect the new field value.
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
                  data: merge(
                    rubric.data ||
                      getEmptyRubric(underscoresToHyphens(rubric.category) as JudgingCategory),
                    {
                      fields: {
                        ...(rubric.data?.fields || {}),
                        [fieldId]: fieldValue
                      }
                    }
                  )
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
                  data: merge(
                    rubric.data ||
                      getEmptyRubric(underscoresToHyphens(rubric.category) as JudgingCategory),
                    {
                      feedback
                    }
                  )
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
 * Reconciler for rubric updates from subscriptions.
 * Handles RubricValueUpdated, RubricFeedbackUpdated, RubricStatusUpdated, and RubricAwardsUpdated events.
 */
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

          return rubric;
        })
      }
    }
  });
};

/**
 * Creates a subscription configuration for real-time rubric updates.
 * Syncs changes from other judges in the division.
 */
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
