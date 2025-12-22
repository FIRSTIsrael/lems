import { RedisEventTypes } from '@lems/types/api/lems/redis';
import { AudienceDisplayScreen } from '@lems/database';
import {
  createSubscriptionIterator,
  SubscriptionResult,
  BaseSubscriptionArgs
} from '../base-subscription';

interface AudienceDisplaySettingUpdatedEvent {
  display: AudienceDisplayScreen;
  settingKey: string;
  settingValue: unknown;
}

const processAudienceDisplaySettingUpdatedEvent = async (
  event: Record<string, unknown>
): Promise<SubscriptionResult<AudienceDisplaySettingUpdatedEvent>> => {
  const eventData = event.data as Record<string, unknown>;

  if (!eventData.display || !eventData.settingKey) {
    return null;
  }

  const result: AudienceDisplaySettingUpdatedEvent = {
    display: eventData.display as AudienceDisplayScreen,
    settingKey: eventData.settingKey as string,
    settingValue: eventData.settingValue as unknown
  };

  return result;
};

const audienceDisplaySettingUpdatedSubscribe = (
  _root: unknown,
  args: BaseSubscriptionArgs & Record<string, unknown>
) => {
  const divisionId = args.divisionId as string;

  if (!divisionId) {
    const errorMsg = 'divisionId is required for audienceDisplaySettingUpdated subscription';
    throw new Error(errorMsg);
  }

  return createSubscriptionIterator(divisionId, RedisEventTypes.AUDIENCE_DISPLAY_SETTING_UPDATED);
};

/**
 * Subscription resolver object for audienceDisplaySettingUpdated
 * GraphQL subscriptions require a subscribe function
 */
export const audienceDisplaySettingUpdatedResolver = {
  subscribe: audienceDisplaySettingUpdatedSubscribe,
  resolve: async (
    event: Record<string, unknown>
  ): Promise<SubscriptionResult<AudienceDisplaySettingUpdatedEvent>> => {
    return processAudienceDisplaySettingUpdatedEvent(event);
  }
};
