import { FinalDeliberationStage, FinalDeliberationAwards } from '@lems/database';
import { validateChampionsStage } from './champions';
import { validateCoreAwardsStage } from './core-awards';
import { validateOptionalAwardsStage } from './optional-awards';
import { validateReviewStage } from './review';

/**
 * Validates that the current stage has all required data before advancing
 */
export async function validateStageCompletion(deliberation: {
  stage: FinalDeliberationStage;
  awards: FinalDeliberationAwards;
}): Promise<void> {
  switch (deliberation.stage) {
    case 'champions':
      validateChampionsStage(deliberation);
      break;
    case 'core-awards':
      validateCoreAwardsStage(deliberation);
      break;
    case 'optional-awards':
      validateOptionalAwardsStage();
      break;
    case 'review':
      validateReviewStage();
      break;
  }
}
