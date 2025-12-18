import { gql, TypedDocumentNode } from '@apollo/client';
import { merge, Reconciler } from '@lems/shared/utils';
import type { SubscriptionConfig } from '../../../hooks/use-page-data';
import type { AudienceDisplayScreen, AudienceDisplayData } from '../types';

interface AudienceDisplaySwitchedEvent {
  activeDisplay: AudienceDisplayScreen;
  version: number;
}

interface AudienceDisplaySwitchedSubscriptionData {
  audienceDisplaySwitched: AudienceDisplaySwitchedEvent;
}

interface SubscriptionVars {
  divisionId: string;
  lastSeenVersion?: number;
}

export const AUDIENCE_DISPLAY_SWITCHED_SUBSCRIPTION: TypedDocumentNode<
  AudienceDisplaySwitchedSubscriptionData,
  SubscriptionVars
> = gql`
  subscription AudienceDisplaySwitched($divisionId: String!, $lastSeenVersion: Int) {
    audienceDisplaySwitched(divisionId: $divisionId, lastSeenVersion: $lastSeenVersion) {
      activeDisplay
      version
    }
  }
`;

const audienceDisplaySwitchedReconciler: Reconciler<
  AudienceDisplayData,
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
): SubscriptionConfig<unknown, AudienceDisplayData, SubscriptionVars> {
  return {
    subscription: AUDIENCE_DISPLAY_SWITCHED_SUBSCRIPTION,
    subscriptionVariables: {
      divisionId
    },
    updateQuery: audienceDisplaySwitchedReconciler as (
      prev: AudienceDisplayData,
      subscriptionData: { data?: unknown }
    ) => AudienceDisplayData
  };
}
