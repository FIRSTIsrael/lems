import { FinalDeliberationAwards, Award } from '@lems/database';
import { MutationError, MutationErrorCode } from '@lems/types/api/lems';
import { selectAdvancingTeams } from '@lems/shared/deliberation';
import {
  buildCoopertitionResults,
  computeTeamAverages,
  selectCoopertitionWinners
} from '@lems/shared/awards';
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
 * Fetches team eligibility status (arrived, disqualified) for a list of teams
 */
async function getTeamEligibility(
  divisionId: string,
  teamIds: string[]
): Promise<Record<string, { arrived: boolean; disqualified: boolean }>> {
  const eligibility = await db.raw.sql
    .selectFrom('team_divisions')
    .select(['team_id', 'arrived', 'disqualified'])
    .where('division_id', '=', divisionId)
    .where('team_id', 'in', teamIds)
    .execute();

  return eligibility.reduce(
    (acc, row) => {
      acc[row.team_id] = {
        arrived: row.arrived,
        disqualified: row.disqualified
      };
      return acc;
    },
    {} as Record<string, { arrived: boolean; disqualified: boolean }>
  );
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

  // Fetch team eligibility status (arrived, disqualified)
  const teamEligibility = await getTeamEligibility(
    divisionId,
    teams.map(t => t.id)
  );

  await assignChampionsToTeams(divisionId, champions);

  const allTeamScores = await calculateAllTeamScores(divisionId, teams);
  const allTeamsWithRanks = await rankTeams(allTeamScores, divisionId);

  // Assign robot performance awards based on field performance (not affected by disqualification)
  const robotPerformanceAwards = await db.awards.byDivisionId(divisionId).get('robot-performance');
  if (robotPerformanceAwards.length > 0) {
    const robotPerformanceWinners = allTeamsWithRanks
      .sort((a, b) => a.ranks['robot-game'] - b.ranks['robot-game'] || a.teamNumber - b.teamNumber)
      .slice(0, robotPerformanceAwards.length)
      .map(t => t.teamId);
    await assignRobotPerformanceAwards(divisionId, robotPerformanceWinners, robotPerformanceAwards);
  }

  await assignCoopertitionAwards(divisionId);

  // Filter to eligible teams for judging-based awards
  const eligibleTeams = teams.filter(t => {
    const status = teamEligibility[t.id];
    return status && status.arrived && !status.disqualified;
  });

  if (eligibleTeams.length === 0) {
    await updateFinalDeliberationAwards(divisionId);
    return;
  }

  // Rank eligible teams for advancement and other judging-based awards
  const teamsWithRanks = allTeamsWithRanks.filter(t =>
    eligibleTeams.some(et => et.id === t.teamId)
  );

  const advancementConfig = await getAdvancementConfig(divisionId);
  if (!advancementConfig) {
    await updateFinalDeliberationAwards(divisionId);
    return;
  }

  const advancingTeamIds = selectAdvancingTeams(
    teamsWithRanks,
    Object.values(champions ?? {}),
    advancementConfig.advancement_percent,
    teams.length
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
    const placeKey = String(award.place) as '1' | '2' | '3' | '4';
    const teamId = champions?.[placeKey];
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
  divisionId: string,
  robotPerformanceTeams: string[],
  robotPerformanceAwards: Award[]
): Promise<void> => {
  for (let i = 0; i < robotPerformanceAwards.length; i++) {
    const award = robotPerformanceAwards[i];
    const teamId = robotPerformanceTeams[i];
    if (teamId) {
      await db.awards.assign(award.id, teamId);
    }
  }

  const finalDeliberation = await db.finalDeliberations.byDivision(divisionId).get();
  if (finalDeliberation) {
    const updatedAwards = { ...finalDeliberation.awards };
    updatedAwards['robot-performance'] = robotPerformanceTeams;
    await db.finalDeliberations.byDivision(divisionId).update({
      awards: updatedAwards
    });
  }
};

/**
 * Assigns Coopertition (two award rows per place) to the best paired matches
 */
export const assignCoopertitionAwards = async (divisionId: string): Promise<void> => {
  const awards = await db.awards.byDivisionId(divisionId).get('coopertition');
  if (awards.length === 0) return;

  const rows = [...awards].sort((a, b) => a.place - b.place || a.index - b.index);
  const places = Math.floor(rows.length / 2);

  const [matches, tables, scoresheets] = await Promise.all([
    db.robotGameMatches.byDivision(divisionId).getAll(),
    db.tables.byDivisionId(divisionId).getAll(),
    db.scoresheets.byDivision(divisionId).byStage('RANKING').getAll()
  ]);

  const scoresheetInputs = scoresheets.map(s => ({
    teamId: s.teamId,
    stage: s.stage,
    round: s.round,
    status: s.status,
    score: s.data?.score ?? 0
  }));

  const results = buildCoopertitionResults(
    matches.map(m => ({
      matchNumber: m.number,
      stage: m.stage,
      round: m.round,
      participants: m.participants.map(p => ({ teamId: p.team_id, tableId: p.table_id }))
    })),
    tables.map(t => ({ id: t.id, name: t.name, pairKey: t.pair_key, side: t.side })),
    scoresheetInputs
  );
  const winners = selectCoopertitionWinners(results, computeTeamAverages(scoresheetInputs), places);

  const winnerIds = winners.flat();
  for (let i = 0; i < rows.length; i++) {
    const teamId = winnerIds[i];
    if (teamId) {
      await db.awards.assign(rows[i].id, teamId);
    }
  }

  const finalDeliberation = await db.finalDeliberations.byDivision(divisionId).get();
  if (finalDeliberation) {
    await db.finalDeliberations.byDivision(divisionId).update({
      awards: { ...finalDeliberation.awards, coopertition: winnerIds }
    });
  }
};

/**
 * Creates Award entries for advancing teams
 */
async function createAdvancementAwards(
  divisionId: string,
  advancingTeamIds: string[]
): Promise<void> {
  const _advancementAwards = await db.awards.byDivisionId(divisionId).get('advancement');
  if (_advancementAwards.length > 0) {
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
