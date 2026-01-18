import { gql, TypedDocumentNode } from '@apollo/client';
import { merge } from '@lems/shared/utils';
import type { SubscriptionConfig } from '../../../../hooks/use-page-data';
import type { MatchStage, McData } from '../types';

interface MatchStageAdvancedEvent {
  _placeholder?: string;
}

interface MatchStageAdvancedSubscriptionData {
  matchStageAdvanced: MatchStageAdvancedEvent;
}

interface SubscriptionVars {
  divisionId: string;
}

export const MATCH_STAGE_ADVANCED_SUBSCRIPTION: TypedDocumentNode<
  MatchStageAdvancedSubscriptionData,
  SubscriptionVars
> = gql`
  subscription MatchStageAdvanced($divisionId: String!) {
    matchStageAdvanced(divisionId: $divisionId) {
      _placeholder
    }
  }
`;

export function createMatchStageAdvancedSubscription(divisionId: string) {
  return {
    subscription: MATCH_STAGE_ADVANCED_SUBSCRIPTION,
    subscriptionVariables: { divisionId },
    updateQuery: (prev: McData, { data }: { data?: unknown }) => {
      if (!prev.division?.field || !data) return prev;
      return merge(prev, {
        division: {
          field: {
            currentStage: 'RANKING' as MatchStage
          }
        }
      });
    }
  } as SubscriptionConfig<unknown, McData, SubscriptionVars>;
}
