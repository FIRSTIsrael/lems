import { gql, type TypedDocumentNode } from '@apollo/client';
import { kebabCaseToCamelCase, merge, type Reconciler } from '@lems/shared/utils';
import { FinalDeliberationAwards } from '@lems/database';
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

  const awardsUpdate: Partial<FinalDeliberationAwards> = {};
  if (event.awards) {
    try {
      const parsedAwardsUpdate = JSON.parse(event.awards);
      // Keys to camelcase
      for (const [key, value] of Object.entries(parsedAwardsUpdate)) {
        if (key === 'champions') awardsUpdate['champions'] = value as Record<number, string>;
        if (key === 'optional-awards')
          awardsUpdate['optionalAwards'] = {
            ...prev.division.judging.finalDeliberation.optionalAwards,
            ...(value as Record<string, string[]>)
          } as Record<string, string[]>;
        const camelCaseKey = kebabCaseToCamelCase(key) as
          | 'robot-performance'
          | 'innovation-project'
          | 'robot-design'
          | 'core-values';
        awardsUpdate[camelCaseKey] = value as string[];
      }
    } catch {
      // Ignore JSON parse errors
    }
  }

  const stageDataUpdate: Partial<FinalJudgingDeliberation> = {};
  if (event.stageData) {
    try {
      const parsedStageData = JSON.parse(event.stageData);
      if (parsedStageData['core-awards']?.manualEligibility) {
        stageDataUpdate.coreAwardsManualEligibility =
          parsedStageData['core-awards'].manualEligibility;
      }
      if (parsedStageData['optional-awards']?.manualEligibility) {
        stageDataUpdate.optionalAwardsManualEligibility =
          parsedStageData['optional-awards'].manualEligibility;
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
          ...awardsUpdate,
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
