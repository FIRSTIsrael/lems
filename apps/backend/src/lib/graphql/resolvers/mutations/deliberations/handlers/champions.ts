import { FinalDeliberationAwards, Award } from '@lems/database';
import { MutationError, MutationErrorCode } from '@lems/types/api/lems';
import { selectAdvancingTeams } from '@lems/shared/deliberation';
import db from '../../../../../database';
import { calculateAllTeamScores, rankTeams, updateFinalDeliberationAwards } from './utils';

/**
 * Validates champions placement (at least 1st place must be assigned)
 */
export function validateChampionsStage(deliberation: { awards: FinalDeliberationAwards }): void {
  const champions = deliberation.awards.champions || {};
  if (!champions['1']) {
    throw new MutationError(
      MutationErrorCode.FORBIDDEN,
      'Cannot advance from champions stage without assigning 1st place'
    );
  }
}

/**
 * Handles advancement award creation when leaving champions stage
 */
export async function handleChampionsStageCompletion(
  divisionId: string,
  champions: FinalDeliberationAwards['champions']
): Promise<void> {
  const teams = await db.teams.byDivisionId(divisionId).getAll();
  if (teams.length === 0) {
    return;
  }

  await assignChampionsToTeams(divisionId, champions);

  const teamScores = await calculateAllTeamScores(divisionId, teams);
  const teamsWithRanks = await rankTeams(teamScores, divisionId);

  const robotPerformanceAwards = await db.awards.byDivisionId(divisionId).get('robot-performance');
  const robotPerformanceWinners = teamsWithRanks
    .sort((a, b) => a.ranks['robot-game'] - b.ranks['robot-game'])
    .slice(0, robotPerformanceAwards.length)
    .map(t => t.teamId);
  await assignRobotPerformanceAwards(robotPerformanceWinners, robotPerformanceAwards);

  const advancementConfig = await getAdvancementConfig(divisionId);
  if (!advancementConfig) {
    await updateFinalDeliberationAwards(divisionId);
    return;
  }

  const advancingTeamIds = selectAdvancingTeams(
    teamsWithRanks,
    Object.values(champions),
    advancementConfig.advancement_percent
  );

  if (advancingTeamIds.length === 0) {
    return;
  }

  await createAdvancementAwards(divisionId, advancingTeamIds);
  await updateFinalDeliberationAwards(divisionId);
}

/**
 * Gets advancement configuration for the division
 */
async function getAdvancementConfig(
  divisionId: string
): Promise<{ advancement_percent: number } | null> {
  const division = await db.divisions.byId(divisionId).get();
  if (!division) return null;

  const event = await db.raw.sql
    .selectFrom('events')
    .innerJoin('event_settings', 'event_settings.event_id', 'events.id')
    .select('event_settings.advancement_percent')
    .where('events.id', '=', division.event_id)
    .executeTakeFirst();

  if (!event || event.advancement_percent === 0) {
    return null;
  }

  return event;
}

const assignChampionsToTeams = async (
  divisionId: string,
  champions: FinalDeliberationAwards['champions']
): Promise<void> => {
  const championsAwards = await db.awards.byDivisionId(divisionId).get('champions');
  for (const award of championsAwards) {
    const teamId = champions[award.place];
    if (!teamId) {
      throw new MutationError(
        MutationErrorCode.FORBIDDEN,
        `Champion place ${award.place} is not assigned to any team`
      );
    }
    await db.awards.assign(award.id, teamId);
  }
};

const assignRobotPerformanceAwards = async (
  teamsWithRanks: string[],
  robotPerformanceAwards: Award[]
): Promise<void> => {
  for (let i = 0; i < robotPerformanceAwards.length; i++) {
    const award = robotPerformanceAwards[i];
    const teamId = teamsWithRanks[i];
    if (teamId) {
      await db.awards.assign(award.id, teamId);
    }
  }
};

/**
 * Creates Award entries for advancing teams
 */
async function createAdvancementAwards(
  divisionId: string,
  advancingTeamIds: string[]
): Promise<void> {
  const adavncementAwards = await db.awards.byDivisionId(divisionId).get('advancement');
  if (adavncementAwards.length > 0) {
    // Advancement awards already exist
    return;
  }

  const advancementAwards = advancingTeamIds.map((teamId, index) => ({
    division_id: divisionId,
    name: 'advancement',
    index: -1,
    place: index + 1,
    type: 'TEAM' as const,
    is_optional: false,
    show_places: false,
    allow_nominations: false,
    automatic_assignment: false,
    winner_id: teamId,
    winner_name: null
  }));

  await db.awards.createMany(advancementAwards);
}
