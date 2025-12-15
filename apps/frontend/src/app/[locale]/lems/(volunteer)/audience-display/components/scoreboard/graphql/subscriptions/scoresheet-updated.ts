import { gql, type TypedDocumentNode } from '@apollo/client';
import { merge, updateById, type Reconciler } from '@lems/shared/utils';
import type { SubscriptionConfig } from '../../../../../hooks/use-page-data';
import type { ScoreboardData, ScoresheetUpdatedEvent } from '../types';

interface SubscriptionVars {
  divisionId: string;
  lastSeenVersion?: number;
}

type SubscriptionResult = {
  scoresheetUpdated: ScoresheetUpdatedEvent;
};

export const SCORESHEET_UPDATED_SUBSCRIPTION: TypedDocumentNode<
  SubscriptionResult,
  SubscriptionVars
> = gql`
  subscription ScoresheetUpdated($divisionId: String!, $lastSeenVersion: Int) {
    scoresheetUpdated(divisionId: $divisionId, lastSeenVersion: $lastSeenVersion) {
      ... on ScoresheetMissionClauseUpdated {
        scoresheetId
        missionId
        clauseIndex
        clauseValue
        version
      }
      ... on ScoresheetStatusUpdated {
        scoresheetId
        status
        version
      }
      ... on ScoresheetEscalatedUpdated {
        scoresheetId
        escalated
        version
      }
    }
  }
`;

const scoresheetUpdatedReconciler: Reconciler<ScoreboardData, SubscriptionResult> = (
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
              score: event.score
            });
          }

          if (event.__typename === 'ScoresheetStatusUpdated') {
            return merge(scoresheet, {
              status: event.status
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
): SubscriptionConfig<unknown, ScoreboardData, SubscriptionVars> {
  return {
    subscription: SCORESHEET_UPDATED_SUBSCRIPTION,
    subscriptionVariables: {
      divisionId
    },
    updateQuery: scoresheetUpdatedReconciler as (
      prev: ScoreboardData,
      subscriptionData: { data?: unknown }
    ) => ScoreboardData
  };
}
