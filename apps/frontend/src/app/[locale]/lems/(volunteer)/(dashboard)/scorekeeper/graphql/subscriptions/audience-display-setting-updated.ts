import { gql, TypedDocumentNode } from '@apollo/client';
import { merge, Reconciler } from '@lems/shared/utils';
import type { SubscriptionConfig } from '../../../../hooks/use-page-data';
import type { AudienceDisplayScreen, ScorekeeperData } from '../types';

interface AudienceDisplaySettingUpdatedEvent {
  display: AudienceDisplayScreen;
  settingKey: string;
  settingValue: unknown;
  version: number;
}

interface AudienceDisplaySettingUpdatedSubscriptionData {
  audienceDisplaySettingUpdated: AudienceDisplaySettingUpdatedEvent;
}

interface SubscriptionVars {
  divisionId: string;
  lastSeenVersion?: number;
}

export const AUDIENCE_DISPLAY_SETTING_UPDATED_SUBSCRIPTION: TypedDocumentNode<
  AudienceDisplaySettingUpdatedSubscriptionData,
  SubscriptionVars
> = gql`
  subscription AudienceDisplaySettingUpdated($divisionId: String!, $lastSeenVersion: Int) {
    audienceDisplaySettingUpdated(divisionId: $divisionId, lastSeenVersion: $lastSeenVersion) {
      display
      settingKey
      settingValue
      version
    }
  }
`;

const audienceDisplaySettingUpdatedReconciler: Reconciler<
  ScorekeeperData,
  AudienceDisplaySettingUpdatedSubscriptionData
> = (prev, { data }) => {
  if (!data?.audienceDisplaySettingUpdated) return prev;

  const event = data.audienceDisplaySettingUpdated;
  const { display, settingKey, settingValue } = event;

  return merge(prev, {
    division: {
      field: {
        audienceDisplay: {
          settings: {
            [display]: {
              [settingKey]: settingValue
            }
          }
        }
      }
    }
  });
};

export function createAudienceDisplaySettingUpdatedSubscription(
  divisionId: string
): SubscriptionConfig<unknown, ScorekeeperData, SubscriptionVars> {
  return {
    subscription: AUDIENCE_DISPLAY_SETTING_UPDATED_SUBSCRIPTION,
    subscriptionVariables: {
      divisionId
    },
    updateQuery: audienceDisplaySettingUpdatedReconciler as (
      prev: ScorekeeperData,
      subscriptionData: { data?: unknown }
    ) => ScorekeeperData
  };
}
