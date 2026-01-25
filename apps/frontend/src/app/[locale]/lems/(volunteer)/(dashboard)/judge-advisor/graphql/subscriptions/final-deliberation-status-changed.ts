import { gql, type TypedDocumentNode } from '@apollo/client';
import { merge, type Reconciler } from '@lems/shared/utils';
import type { QueryData } from '../types';

interface FinalDeliberationStatusChangedEvent {
  divisionId: string;
  status: string;
  stage: string;
}

type SubscriptionResult = {
  finalDeliberationStatusChanged: FinalDeliberationStatusChangedEvent;
};

type SubscriptionVariables = {
  divisionId: string;
};

export const FINAL_DELIBERATION_STATUS_CHANGED_SUBSCRIPTION: TypedDocumentNode<
  SubscriptionResult,
  SubscriptionVariables
> = gql`
  subscription FinalDeliberationStatusChanged($divisionId: String!) {
    finalDeliberationStatusChanged(divisionId: $divisionId) {
      divisionId
      status
      stage
    }
  }
`;

const finalDeliberationStatusChangedReconciler: Reconciler<QueryData, SubscriptionResult> = (
  prev,
  { data }
) => {
  if (!data?.finalDeliberationStatusChanged) return prev;

  const event = data.finalDeliberationStatusChanged;

  return merge(prev, {
    division: {
      judging: {
        finalDeliberation: {
          status: event.status,
          stage: event.stage
        }
      }
    }
  });
};

export function createFinalDeliberationStatusChangedSubscription(divisionId: string) {
  return {
    subscription: FINAL_DELIBERATION_STATUS_CHANGED_SUBSCRIPTION,
    subscriptionVariables: { divisionId },
    updateQuery: finalDeliberationStatusChangedReconciler as (
      prev: QueryData,
      subscriptionData: { data?: unknown }
    ) => QueryData
  };
}
