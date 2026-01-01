import { GraphQLFieldResolver } from 'graphql';
import { RedisEventTypes } from '@lems/types/api/lems/redis';
import { MutationError, MutationErrorCode } from '@lems/types/api/lems';
import { DivisionState, AudienceDisplayScreen } from '@lems/database';
import type { GraphQLContext } from '../../../apollo-server';
import db from '../../../../database';
import { getRedisPubSub } from '../../../../redis/redis-pubsub';
import { authorizeAudienceDisplayAccess } from './utils';

interface UpdateAudienceDisplaySettingArgs {
  divisionId: string;
  display: AudienceDisplayScreen;
  settingKey: string;
  settingValue: unknown;
}

interface UpdateAudienceDisplaySettingEvent {
  display: AudienceDisplayScreen;
  settingKey: string;
  settingValue: unknown;
}

/**
 * Resolver for Mutation.updateAudienceDisplaySetting
 * Updates a setting for the audience display in a division.
 */
export const updateAudienceDisplaySettingResolver: GraphQLFieldResolver<
  unknown,
  GraphQLContext,
  UpdateAudienceDisplaySettingArgs,
  Promise<UpdateAudienceDisplaySettingEvent>
> = async (_root, { divisionId, display, settingKey, settingValue }, context) => {
  try {
    await authorizeAudienceDisplayAccess(context, divisionId);

    // Update the division's settings in MongoDB
    const result = await db.raw.mongo.collection<DivisionState>('division_states').findOneAndUpdate(
      { divisionId },
      {
        $set: {
          [`audienceDisplay.settings.${display}.${settingKey}`]: settingValue
        }
      },
      { returnDocument: 'after' }
    );

    if (!result) {
      throw new MutationError(
        MutationErrorCode.INTERNAL_ERROR,
        `Failed to update audience display for ${divisionId}`
      );
    }

    // Publish event to notify subscribers
    const pubSub = getRedisPubSub();
    await pubSub.publish(divisionId, RedisEventTypes.AUDIENCE_DISPLAY_SETTING_UPDATED, {
      display,
      settingKey,
      settingValue
    });

    return { display, settingKey, settingValue };
  } catch (error) {
    throw error instanceof Error ? error : new Error(String(error));
  }
};
