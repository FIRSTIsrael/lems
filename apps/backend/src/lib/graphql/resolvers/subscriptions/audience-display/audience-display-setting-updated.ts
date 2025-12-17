import { RedisEventTypes } from '@lems/types/api/lems/redis';
import { AudienceDisplayScreen } from '@lems/database';
import {
  createSubscriptionIterator,
  SubscriptionResult,
  BaseSubscriptionArgs,
  isGapMarker
} from '../base-subscription';

interface AudienceDisplaySettingUpdatedEvent {
  display: AudienceDisplayScreen;
  settingKey: string;
  settingValue: unknown;
  version: number;
}

const processAudienceDisplaySettingUpdatedEvent = async (
  event: Record<string, unknown>
): Promise<SubscriptionResult<AudienceDisplaySettingUpdatedEvent>> => {
  // Check for gap marker (recovery buffer exceeded)
  if (isGapMarker(event.data)) {
    console.warn('[AudienceDisplaySettingUpdated] Recovery gap detected - client should refetch');
    return event.data;
  }

  const eventData = event.data as Record<string, unknown>;

  if (!eventData.display || !eventData.settingKey || !eventData.settingValue) {
    return null;
  }

  const result: AudienceDisplaySettingUpdatedEvent = {
    display: eventData.display as AudienceDisplayScreen,
    settingKey: eventData.settingKey as string,
    settingValue: eventData.settingValue as unknown,
    version: (event.version as number) ?? 0
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

  const lastSeenVersion = (args.lastSeenVersion as number) || 0;
  return createSubscriptionIterator(
    divisionId,
    RedisEventTypes.AUDIENCE_DISPLAY_SETTING_UPDATED,
    lastSeenVersion
  );
};

/**
 * Subscription resolver object for judgingSessionAborted
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
