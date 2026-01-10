import { RedisEventTypes } from '@lems/types/api/lems/redis';
import { MutationError, MutationErrorCode } from '@lems/types/api/lems';
import { FinalDeliberationAwards } from '@lems/database';
import { getRedisPubSub } from '../../../../../redis/redis-pubsub';

/**
 * Validates that required core awards are assigned
 */
export function validateCoreAwardsStage(deliberation: { awards: FinalDeliberationAwards }): void {
  const awards = deliberation.awards;

  if (!awards['innovation-project'] || awards['innovation-project'].length === 0) {
    throw new MutationError(
      MutationErrorCode.FORBIDDEN,
      'Innovation Project award must be assigned before advancing'
    );
  }

  if (!awards['robot-design'] || awards['robot-design'].length === 0) {
    throw new MutationError(
      MutationErrorCode.FORBIDDEN,
      'Robot Design award must be assigned before advancing'
    );
  }

  if (!awards['core-values'] || awards['core-values'].length === 0) {
    throw new MutationError(
      MutationErrorCode.FORBIDDEN,
      'Core Values award must be assigned before advancing'
    );
  }
}

/**
 * Handles core awards stage completion when advancing to optional awards stage
 * Core awards typically include: Innovation Project, Robot Design, and Core Values
 */
export async function handleCoreAwardsStageCompletion(divisionId: string): Promise<void> {
  // TODO: Implement core awards stage completion logic
  // This could include:
  // - Finalizing core award selections
  // - Creating any automatic awards based on selections
  // - Calculating statistics or rankings for core awards
  // - Any cleanup or validation before moving to optional awards

  // For now, publish a placeholder event indicating the stage was processed
  const pubSub = getRedisPubSub();
  await pubSub.publish(divisionId, RedisEventTypes.FINAL_DELIBERATION_UPDATED, {
    divisionId,
    message: 'Core awards stage completed'
  });
}

/**
 * Validates that all required core awards are properly assigned
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function validateCoreAwardsAssignment(): Promise<void> {
  // TODO: Add validation logic for core awards
  // Check that all teams that should receive core awards have them properly assigned
}

/**
 * Finalizes core award selections
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function finalizeCoreAwardSelections(): Promise<void> {
  // TODO: Implement core award finalization
  // Lock in selections, prevent further modifications if needed
}
