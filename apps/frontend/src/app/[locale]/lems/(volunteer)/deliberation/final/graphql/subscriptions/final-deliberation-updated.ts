import { gql, type TypedDocumentNode } from '@apollo/client';
import { merge, type Reconciler } from '@lems/shared/utils';
import type { FinalDeliberationData, FinalJudgingDeliberation } from '../types';

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

const finalDeliberationUpdatedReconciler: Reconciler<FinalDeliberationData, SubscriptionResult> = (
  prev,
  { data }
) => {
  if (!data?.finalDeliberationUpdated) return prev;

  const event = data.finalDeliberationUpdated;

  let stageDataUpdate: Partial<FinalJudgingDeliberation> = {};
  if (event.stageData) {
    try {
      const parsedStageData = JSON.parse(event.stageData);
      if (parsedStageData['core-awards']?.manualEligibility) {
        stageDataUpdate = {
          coreAwardsManualEligibility: parsedStageData['core-awards'].manualEligibility
        };
      } else if (parsedStageData['optional-awards']?.manualEligibility) {
        stageDataUpdate = {
          optionalAwardsManualEligibility: parsedStageData['optional-awards'].manualEligibility
        };
      }
    } catch {
      // Ignore JSON parse errors
    }
  }

  return merge(prev, {
    division: {
      judging: {
        finalDeliberation: {
          // Update status if provided
          ...(!!event.status && { status: event.status }),
          // Update stage if provided
          ...(!!event.stage && { stage: event.stage }),
          // Update startTime if provided
          ...(!!event.startTime && { startTime: event.startTime }),
          // Update completionTime if provided
          ...(!!event.completionTime && { completionTime: event.completionTime }),
          ...(!!event.awards && JSON.parse(event.awards)),
          ...stageDataUpdate
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
