import { gql, TypedDocumentNode } from '@apollo/client';
import { merge, Reconciler } from '@lems/shared/utils';
import type { SubscriptionConfig } from '../../../../hooks/use-page-data';
import type { AudienceDisplayScreen, ScorekeeperData } from '../types';

interface AudienceDisplaySwitchedEvent {
  activeDisplay: AudienceDisplayScreen;
}

interface AudienceDisplaySwitchedSubscriptionData {
  audienceDisplaySwitched: AudienceDisplaySwitchedEvent;
}

interface SubscriptionVars {
  divisionId: string;
}

export const AUDIENCE_DISPLAY_SWITCHED_SUBSCRIPTION: TypedDocumentNode<
  AudienceDisplaySwitchedSubscriptionData,
  SubscriptionVars
> = gql`
  subscription AudienceDisplaySwitched($divisionId: String!) {
    audienceDisplaySwitched(divisionId: $divisionId) {
      activeDisplay
    }
  }
`;

const audienceDisplaySwitchedReconciler: Reconciler<
  ScorekeeperData,
  AudienceDisplaySwitchedSubscriptionData
> = (prev, { data }) => {
  if (!data?.audienceDisplaySwitched) return prev;

  const event = data.audienceDisplaySwitched;
  const { activeDisplay } = event;

  return merge(prev, {
    division: {
      field: {
        audienceDisplay: {
          activeDisplay
        }
      }
    }
  });
};

export function createAudienceDisplaySwitchedSubscription(
  divisionId: string
): SubscriptionConfig<unknown, ScorekeeperData, SubscriptionVars> {
  return {
    subscription: AUDIENCE_DISPLAY_SWITCHED_SUBSCRIPTION,
    subscriptionVariables: {
      divisionId
    },
    updateQuery: audienceDisplaySwitchedReconciler as (
      prev: ScorekeeperData,
      subscriptionData: { data?: unknown }
    ) => ScorekeeperData
  };
}
