import { gql, type TypedDocumentNode } from '@apollo/client';
import { merge, type Reconciler } from '@lems/shared/utils';
import type { FinalDeliberationData } from '../types';

interface FinalDeliberationUpdatedEvent {
  divisionId: string;
  status?: string | null;
  stage?: string | null;
  startTime?: string | null;
  completionTime?: string | null;
  awards?: string | null;
  stageData?: string | null;
}

type SubscriptionResult = {
  finalDeliberationUpdated: FinalDeliberationUpdatedEvent;
};

type SubscriptionVariables = {
  divisionId: string;
};

export const FINAL_DELIBERATION_UPDATED_SUBSCRIPTION: TypedDocumentNode<
  SubscriptionResult,
  SubscriptionVariables
> = gql`
  subscription FinalDeliberationUpdated($divisionId: String!) {
    finalDeliberationUpdated(divisionId: $divisionId) {
      divisionId
      status
      stage
      startTime
      completionTime
      awards
      stageData
    }
  }
`;

const finalDeliberationUpdatedReconciler: Reconciler<
  FinalDeliberationData,
  SubscriptionResult
> = (prev, { data }) => {
  if (!data?.finalDeliberationUpdated) return prev;

  const event = data.finalDeliberationUpdated;

  return merge(prev, {
    division: {
      judging: {
        finalDeliberation: {
          // Update status if provided
          ...(event.status !== undefined && { status: event.status }),
          // Update stage if provided
          ...(event.stage !== undefined && { stage: event.stage }),
          // Update startTime if provided
          ...(event.startTime !== undefined && { startTime: event.startTime }),
          // Update completionTime if provided
          ...(event.completionTime !== undefined && { completionTime: event.completionTime }),
          // Update awards if provided (JSON string)
          ...(event.awards !== undefined && { awards: event.awards }),
          // Update stageData if provided (JSON string)
          ...(event.stageData !== undefined && { stageData: event.stageData })
        }
      }
    }
  });
};

export function createFinalDeliberationUpdatedSubscription(divisionId: string) {
  return {
    subscription: FINAL_DELIBERATION_UPDATED_SUBSCRIPTION,
    subscriptionVariables: { divisionId },
    updateQuery: finalDeliberationUpdatedReconciler as (
      prev: FinalDeliberationData,
      subscriptionData: { data?: unknown }
    ) => FinalDeliberationData
  };
}
