import { RedisEventTypes } from '@lems/types/api/lems/redis';
import { AudienceDisplayScreen } from '@lems/database';
import { getRedisPubSub } from '../../../../redis/redis-pubsub';

interface AudienceDisplaySettingUpdatedSubscribeArgs {
  divisionId: string;
}

interface AudienceDisplaySettingUpdatedEvent {
  display: AudienceDisplayScreen;
  settingKey: string;
  settingValue: unknown;
}

const processAudienceDisplaySettingUpdatedEvent = async (
  event: Record<string, unknown>
): Promise<AudienceDisplaySettingUpdatedEvent | null> => {
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
  { divisionId }: AudienceDisplaySettingUpdatedSubscribeArgs
) => {
  if (!divisionId) throw new Error('divisionId is required');
  const pubSub = getRedisPubSub();
  return pubSub.asyncIterator(divisionId, RedisEventTypes.AUDIENCE_DISPLAY_SETTING_UPDATED);
};

/**
 * Subscription resolver object for audienceDisplaySettingUpdated
 * GraphQL subscriptions require a subscribe function
 */
export const audienceDisplaySettingUpdatedResolver = {
  subscribe: audienceDisplaySettingUpdatedSubscribe,
  resolve: processAudienceDisplaySettingUpdatedEvent
};
