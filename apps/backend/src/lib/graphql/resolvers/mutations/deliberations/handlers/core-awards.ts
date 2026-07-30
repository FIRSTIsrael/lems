import { MutationError, MutationErrorCode } from '@lems/types/api/lems';
import { Award, FinalDeliberationAwards, JudgingCategory } from '@lems/database';
import db from '../../../../../database';
import { calculateAllTeamScores, rankTeams, updateFinalDeliberationAwards } from './utils';

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

  const excellenceInEngineeringAwards = await db.awards
    .byDivisionId(divisionId)
    .get('excellence-in-engineering');

  if (excellenceInEngineeringAwards.length === 0) {
    await updateFinalDeliberationAwards(divisionId);
    return;
  }

  const teamScores = await calculateAllTeamScores(divisionId, teams);
  const teamsWithRanks = await rankTeams(teamScores, divisionId);

  const innovationProjectWinners = awards['innovation-project'] ?? [];
  const robotDesignWinners = awards['robot-design'] ?? [];
  const coreValuesWinners = awards['core-values'] ?? [];

  const excellenceInEngineeringWinners = teamsWithRanks
    .filter(
      t =>
        !Object.values(awards.champions || {}).includes(t.teamId) &&
        !innovationProjectWinners.includes(t.teamId) &&
        !robotDesignWinners.includes(t.teamId) &&
        !coreValuesWinners.includes(t.teamId)
    )
    .sort((a, b) => a.averageRank - b.averageRank)
    .slice(0, excellenceInEngineeringAwards.length)
    .map(t => t.teamId);

  await assignExcellenceInEngineeringAwards(
    divisionId,
    excellenceInEngineeringWinners,
    excellenceInEngineeringAwards
  );

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

const assignExcellenceInEngineeringAwards = async (
  divisionId: string,
  excellenceInEngineeringTeams: string[],
  excellenceInEngineeringAwards: Award[]
): Promise<void> => {
  for (let i = 0; i < excellenceInEngineeringAwards.length; i++) {
    const award = excellenceInEngineeringAwards[i];
    const teamId = excellenceInEngineeringTeams[i];
    if (teamId) {
      await db.awards.assign(award.id, teamId);
    }
  }

  const finalDeliberation = await db.finalDeliberations.byDivision(divisionId).get();
  if (finalDeliberation) {
    const updatedAwards = { ...finalDeliberation.awards };
    updatedAwards.optionalAwards = {
      ...updatedAwards.optionalAwards,
      'excellence-in-engineering': excellenceInEngineeringTeams
    };
    await db.finalDeliberations.byDivision(divisionId).update({
      awards: updatedAwards
    });
  }
};
