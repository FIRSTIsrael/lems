import { gql, type TypedDocumentNode } from '@apollo/client';
import { merge, updateById, type Reconciler } from '@lems/shared/utils';
import type { SubscriptionConfig } from '../../../../../../../hooks/use-page-data';
import type { QueryResult, SubscriptionResult, SubscriptionVariables } from '../types';
import { getEmptyScoresheet } from '../../scoresheet-utils';

export const SCORESHEET_UPDATED_SUBSCRIPTION: TypedDocumentNode<
  SubscriptionResult,
  SubscriptionVariables
> = gql`
  subscription ScoresheetUpdated($divisionId: String!) {
    scoresheetUpdated(divisionId: $divisionId) {
      ... on ScoresheetMissionClauseUpdated {
        scoresheetId
        missionId
        clauseIndex
        clauseValue
      }
      ... on ScoresheetStatusUpdated {
        scoresheetId
        status
      }
      ... on ScoresheetGPUpdated {
        scoresheetId
        gpValue
        notes
      }
      ... on ScoresheetEscalatedUpdated {
        scoresheetId
        escalated
      }
    }
  }
`;

const scoresheetUpdatedReconciler: Reconciler<QueryResult, SubscriptionResult> = (
  prev,
  { data }
) => {
  if (!data?.scoresheetUpdated) return prev;

  const event = data.scoresheetUpdated;
  const { scoresheetId } = event;

  return merge(prev, {
    division: {
      field: {
        scoresheets: updateById(prev.division.field.scoresheets, scoresheetId, scoresheet => {
          if (event.__typename === 'ScoresheetMissionClauseUpdated') {
            return merge(scoresheet, {
              data: merge(scoresheet.data || getEmptyScoresheet(), {
                missions: {
                  ...(scoresheet.data?.missions || {}),
                  [event.missionId]: {
                    ...(scoresheet.data?.missions?.[event.missionId] || {}),
                    [event.clauseIndex]: event.clauseValue
                  }
                }
              })
            });
          }

          if (event.__typename === 'ScoresheetStatusUpdated') {
            return merge(scoresheet, {
              status: event.status
            });
          }

          if (event.__typename === 'ScoresheetGPUpdated') {
            return merge(scoresheet, {
              data: merge(scoresheet.data || getEmptyScoresheet(), {
                gp: {
                  value: event.gpValue,
                  notes: event.notes
                }
              })
            });
          }

          if (event.__typename === 'ScoresheetEscalatedUpdated') {
            return merge(scoresheet, {
              escalated: event.escalated
            });
          }

          return scoresheet;
        })
      }
    }
  });
};

export function createScoresheetUpdatedSubscription(
  divisionId: string
): SubscriptionConfig<unknown, QueryResult, SubscriptionVariables> {
  return {
    subscription: SCORESHEET_UPDATED_SUBSCRIPTION,
    subscriptionVariables: {
      divisionId
    },
    updateQuery: scoresheetUpdatedReconciler as (
      prev: QueryResult,
      subscriptionData: { data?: unknown }
    ) => QueryResult
  };
}
