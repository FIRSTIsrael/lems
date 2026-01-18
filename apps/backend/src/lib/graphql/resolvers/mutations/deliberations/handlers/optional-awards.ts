import { MutationError, MutationErrorCode } from '@lems/types/api/lems';
import { OPTIONAL_AWARDS } from '@lems/shared/awards';
import { Award, FinalDeliberationAwards } from '@lems/database';
import db from '../../../../../database';
import { updateFinalDeliberationAwards } from './utils';

/**
 * Validates that optional awards are properly assigned
 */
export function validateOptionalAwardsStage(
  optionalAwards: FinalDeliberationAwards['optionalAwards'],
  divisionAwards: Award[]
): Promise<void> {
  const divisionOptionalAwards = divisionAwards.filter(award =>
    (OPTIONAL_AWARDS as readonly string[])
      .filter(name => name !== 'excellence-in-engineering')
      .includes(award.name)
  );
  for (const award of divisionOptionalAwards) {
    if (!optionalAwards[award.name] || optionalAwards[award.name].length === 0) {
      return Promise.reject(
        new Error(`Optional award "${award.name}" must have at least one team assigned.`)
      );
    }
  }
}

/**
 * Handles optional awards stage completion when advancing to review stage
 * Optional awards are defined per event and may include various recognition categories
 */
export async function handleOptionalAwardsStageCompletion(
  divisionId: string,
  optionalAwards: FinalDeliberationAwards['optionalAwards']
): Promise<void> {
  await validateOptionalAwardsAssignment(divisionId, optionalAwards);

  await assignOptionalAwardsToTeams(divisionId, optionalAwards);

  await updateFinalDeliberationAwards(divisionId);
}

/**
 * Validates optional award selections
 */
async function validateOptionalAwardsAssignment(
  divisionId: string,
  optionalAwards: FinalDeliberationAwards['optionalAwards']
): Promise<void> {
  const awards = (await db.awards.byDivisionId(divisionId).getAll()).filter(
    award => award.name !== 'robot-performance'
  );
  for (const [awardName, winners] of Object.entries(optionalAwards)) {
    for (const award of awards) {
      if (winners.includes(award.winner_id)) {
        throw new MutationError(
          MutationErrorCode.FORBIDDEN,
          `Award ${awardName} has a winner that was already assigned an award`
        );
      }
    }
  }
}

/**
 * Assigns optional awards to teams in the database
 */
async function assignOptionalAwardsToTeams(
  divisionId: string,
  optionalAwards: FinalDeliberationAwards['optionalAwards']
): Promise<void> {
  for (const [awardName, teamIds] of Object.entries(optionalAwards)) {
    const awards = await db.awards.byDivisionId(divisionId).get(awardName);
    if (awards.length !== teamIds.length) {
      throw new MutationError(
        MutationErrorCode.FORBIDDEN,
        `Number of teams assigned to award ${awardName} does not match number of awards available`
      );
    }
    for (let i = 0; i < teamIds.length; i++) {
      const award = awards[i];
      const teamId = teamIds[i];
      await db.awards.assign(award.id, teamId);
    }
  }
}
