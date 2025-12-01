import { GraphQLFieldResolver } from 'graphql';
import { RedisEventTypes } from '@lems/types/api/lems/redis';
import { MutationError, MutationErrorCode } from '@lems/types/api/lems';
import type { GraphQLContext } from '../../../apollo-server';
import db from '../../../../database';
import { getRedisPubSub } from '../../../../redis/redis-pubsub';
import { authorizeRubricAccess, assertRubricEditable } from './utils';

interface UpdateRubricFeedbackArgs {
  divisionId: string;
  rubricId: string;
  greatJob: string;
  thinkAbout: string;
}

interface RubricFeedbackUpdatedEvent {
  rubricId: string;
  feedback: {
    greatJob: string;
    thinkAbout: string;
  };
  version: number;
}

/**
 * Resolver for Mutation.updateRubricFeedback
 * Updates feedback in a rubric
 */
export const updateRubricFeedbackResolver: GraphQLFieldResolver<
  unknown,
  GraphQLContext,
  UpdateRubricFeedbackArgs,
  Promise<RubricFeedbackUpdatedEvent>
> = async (_root, { divisionId, rubricId, greatJob, thinkAbout }, context) => {
  try {
    const { rubric, rubricObjectId } = await authorizeRubricAccess(context, divisionId, rubricId);

    const status = (rubric.status as string) || 'empty';
    assertRubricEditable(status, context.user?.role);

    const feedbackUpdate = { greatJob, thinkAbout };

    const result = await db.raw.mongo.collection('rubrics').findOneAndUpdate(
      { _id: rubricObjectId },
      {
        $set: {
          'data.feedback': feedbackUpdate,
          // Update status to draft if it's empty
          ...(status === 'empty' && { status: 'draft' })
        }
      },
      { returnDocument: 'after' }
    );

    if (!result) {
      throw new MutationError(
        MutationErrorCode.UNAUTHORIZED,
        `Failed to update rubric ${rubricId}`
      );
    }

    // Publish the update event
    const pubSub = getRedisPubSub();
    const eventPayload = {
      rubricId,
      feedback: feedbackUpdate,
      version: -1
    };
    await pubSub.publish(divisionId, RedisEventTypes.RUBRIC_UPDATED, eventPayload);

    return eventPayload;
  } catch (error) {
    throw error instanceof Error ? error : new Error(String(error));
  }
};
