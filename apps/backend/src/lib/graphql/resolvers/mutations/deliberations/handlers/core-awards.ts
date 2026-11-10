import { MutationError, MutationErrorCode } from '@lems/types/api/lems';
import { FinalDeliberationAwards, JudgingCategory } from '@lems/database';
import db from '../../../../../database';
import { updateFinalDeliberationAwards } from './utils';

const categories: JudgingCategory[] = ['innovation-project', 'robot-design', 'core-values'];

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
export async function handleCoreAwardsStageCompletion(
  divisionId: string,
  awards: FinalDeliberationAwards
): Promise<void> {
  const teams = await db.teams.byDivisionId(divisionId).getAll();
  if (teams.length === 0) {
    return;
  }

  await validateCoreAwardsAssignment(awards);

  await assignCoreAwardsToTeams(divisionId, awards);

  await updateFinalDeliberationAwards(divisionId);
}

/**
 * Validates that all required core awards are properly assigned
 */
async function validateCoreAwardsAssignment(awards: FinalDeliberationAwards): Promise<void> {
  const championsIds = Object.values(awards.champions || {});
  for (const category of categories) {
    const categoryWinners = awards[category] ?? [];
    if (categoryWinners.filter(winnerId => championsIds.includes(winnerId)).length > 0) {
      throw new MutationError(
        MutationErrorCode.FORBIDDEN,
        `Category ${category} has a winner that was already assigned a champions award`
      );
    }
  }
}

/**
 * Assign core award selections
 */
async function assignCoreAwardsToTeams(
  divisionId: string,
  awards: FinalDeliberationAwards
): Promise<void> {
  for (const category of categories) {
    const categoryAwards = await db.awards.byDivisionId(divisionId).get(category);
    for (let i = 0; i < categoryAwards.length; i++) {
      const award = categoryAwards[i];
      const categoryWinners = awards[category] ?? [];
      const teamId = categoryWinners[i];
      if (!teamId) {
        throw new MutationError(
          MutationErrorCode.FORBIDDEN,
          `No team assigned for award ${award.name} in category ${category}`
        );
      }
      await db.awards.assign(award.id, teamId);
    }
  }
}
