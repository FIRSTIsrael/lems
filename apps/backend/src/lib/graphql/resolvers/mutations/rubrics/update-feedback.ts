import { GraphQLFieldResolver } from 'graphql';
import { JudgingCategory } from '@lems/database';
import { RedisEventTypes } from '@lems/types/api/lems/redis';
import { MutationError, MutationErrorCode } from '@lems/types/api/lems';
import type { GraphQLContext } from '../../../apollo-server';
import db from '../../../../database';
import { getRedisPubSub } from '../../../../redis/redis-pubsub';
import {
  authorizeRubricAccess,
  assertRubricEditable,
  determineRubricCompletionStatus
} from './utils';

type RubricFeedbackUpdatedEvent = {
  rubricId: string;
  feedback: {
    greatJob: string;
    thinkAbout: string;
  };
};

interface UpdateRubricFeedbackArgs {
  divisionId: string;
  rubricId: string;
  greatJob: string;
  thinkAbout: string;
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
  const { rubric, rubricObjectId } = await authorizeRubricAccess(context, divisionId, rubricId);

  const status = (rubric.status as string) || 'empty';
  assertRubricEditable(status, context.user?.role);

  const feedbackUpdate = { greatJob, thinkAbout };

  const result = await db.raw.mongo.collection('rubrics').findOneAndUpdate(
    { _id: rubricObjectId },
    {
      $set: {
        'data.feedback': feedbackUpdate
      }
    },
    { returnDocument: 'after' }
  );

  if (!result) {
    throw new MutationError(MutationErrorCode.UNAUTHORIZED, `Failed to update rubric ${rubricId}`);
  }

  // Determine new status based on completion criteria
  const rubricData = result.data as Record<string, unknown>;
  const rubricCategory = result.category as JudgingCategory;
  const newStatus = determineRubricCompletionStatus(rubricData, rubricCategory);

  // Update status if it has changed
  const statusChanged = newStatus !== status;
  if (statusChanged) {
    await db.raw.mongo
      .collection('rubrics')
      .updateOne({ _id: rubricObjectId }, { $set: { status: newStatus } });
  }

  // Publish the update event
  const pubSub = getRedisPubSub();
  const eventPayload = {
    rubricId,
    feedback: feedbackUpdate
  };

  const publishTasks = [pubSub.publish(divisionId, RedisEventTypes.RUBRIC_UPDATED, eventPayload)];

  if (statusChanged) {
    publishTasks.push(
      pubSub.publish(divisionId, RedisEventTypes.RUBRIC_STATUS_CHANGED, {
        rubricId,
        status: newStatus
      })
    );
  }

  await Promise.all(publishTasks);

  return eventPayload;
};
