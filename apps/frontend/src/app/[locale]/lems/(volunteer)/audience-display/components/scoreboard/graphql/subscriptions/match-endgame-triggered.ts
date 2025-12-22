import { gql, TypedDocumentNode } from '@apollo/client';
import type { SubscriptionConfig } from '../../../../../hooks/use-page-data';
import type { ScoreboardData } from '../types';

interface MatchEndgameTriggeredEvent {
  matchId: string;
}

interface MatchEndgameTriggeredSubscriptionData {
  matchEndgameTriggered: MatchEndgameTriggeredEvent;
}

interface SubscriptionVars {
  divisionId: string;
}

export const MATCH_ENDGAME_TRIGGERED_SUBSCRIPTION: TypedDocumentNode<
  MatchEndgameTriggeredSubscriptionData,
  SubscriptionVars
> = gql`
  subscription MatchEndgameTriggered($divisionId: String!) {
    matchEndgameTriggered(divisionId: $divisionId) {
      matchId
    }
  }
`;

function updateQueryWithCallback<TSubscriptionData>(
  subscription: TypedDocumentNode<TSubscriptionData, SubscriptionVars>,
  divisionId: string,
  updateQuery: (prev: ScoreboardData, subscriptionData: { data?: unknown }) => ScoreboardData,
  onData?: (data: TSubscriptionData) => void
): SubscriptionConfig<unknown, ScoreboardData, SubscriptionVars> {
  const baseConfig: SubscriptionConfig<unknown, ScoreboardData, SubscriptionVars> = {
    subscription,
    subscriptionVariables: { divisionId },
    updateQuery
  };

  if (onData) {
    const originalUpdateQuery = baseConfig.updateQuery;
    baseConfig.updateQuery = (prev: ScoreboardData, subscriptionData: { data?: unknown }) => {
      if (subscriptionData.data) {
        onData(subscriptionData.data as TSubscriptionData);
      }
      return originalUpdateQuery(prev, subscriptionData);
    };
  }

  return baseConfig;
}

export function createMatchEndgameTriggeredSubscription(
  divisionId: string,
  onMatchEndgameTriggered?: (
    event: MatchEndgameTriggeredSubscriptionData['matchEndgameTriggered']
  ) => void
): SubscriptionConfig<unknown, ScoreboardData, SubscriptionVars> {
  const updateQuery = (prev: ScoreboardData) => {
    // No state updates needed - this is just a notification event
    // The actual endgame logic (visual feedback, etc.) is handled by the callback
    return prev;
  };

  return updateQueryWithCallback(
    MATCH_ENDGAME_TRIGGERED_SUBSCRIPTION,
    divisionId,
    updateQuery,
    onMatchEndgameTriggered
      ? data => onMatchEndgameTriggered(data.matchEndgameTriggered)
      : undefined
  );
}
