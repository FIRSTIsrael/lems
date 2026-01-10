import { JudgingCategory, FinalDeliberationAwards, Scoresheet, Award } from '@lems/database';
import { RedisEventTypes } from '@lems/types/api/lems/redis';
import { MutationError, MutationErrorCode } from '@lems/types/api/lems';
import { calculateTeamRanks, selectAdvancingTeams } from '@lems/shared/deliberation';
import db from '../../../../../database';
import { getRedisPubSub } from '../../../../../redis/redis-pubsub';

interface TeamData {
  id: string;
  number: number;
}

interface TeamScoreData {
  teamId: string;
  teamNumber: number;
  rubricScores: Record<JudgingCategory, number>;
  gpScore: number;
  robotGameScores: number[];
}

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
  await updateFinalDeliberationAwards(divisionId, advancingTeamIds);
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

/**
 * Calculates scores for all teams (rubric + GP scores)
 */
async function calculateAllTeamScores(
  divisionId: string,
  teams: TeamData[]
): Promise<TeamScoreData[]> {
  const rubrics = await db.rubrics.byDivision(divisionId).getAll();
  const scoresheets = await db.raw.mongo
    .collection<Scoresheet>('scoresheets')
    .find({ divisionId })
    .toArray();

  return teams.map(team => ({
    teamId: team.id,
    teamNumber: team.number,
    rubricScores: calculateRubricScores(team.id, rubrics),
    gpScore: calculateGPScore(team.id, scoresheets),
    robotGameScores: scoresheets.filter(s => s.teamId === team.id).map(s => s.data?.score || 0)
  }));
}

/**
 * Calculates rubric field scores for a specific team
 */
function calculateRubricScores(
  teamId: string,
  rubrics: Array<{
    teamId: string;
    data?: { fields?: Record<string, { value?: number }> };
    category: JudgingCategory;
  }>
): Record<JudgingCategory, number> {
  const rubricScores: Record<JudgingCategory, number> = {
    'innovation-project': 0,
    'robot-design': 0,
    'core-values': 0
  };

  const rubricsForTeam = rubrics.filter(r => r.teamId === teamId);
  rubricsForTeam.forEach(rubric => {
    if (rubric.data?.fields) {
      const fieldSum = Object.values(rubric.data.fields).reduce((sum, field) => {
        return sum + (field.value ?? 0);
      }, 0);
      rubricScores[rubric.category] = fieldSum;
    }
  });

  return rubricScores;
}

/**
 * Calculates GP score for a specific team
 */
function calculateGPScore(
  teamId: string,
  scoresheets: any[] // eslint-disable-line @typescript-eslint/no-explicit-any
): number {
  return scoresheets
    .filter(s => s.teamId === teamId)
    .reduce((sum, sheet) => {
      return sum + (sheet.data?.gp?.value ?? 0);
    }, 0);
}

/**
 * Ranks teams based on their scores and picklists
 */
async function rankTeams(
  teamScores: TeamScoreData[],
  divisionId: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any[]> {
  const picklists = await fetchPicklists(divisionId);

  return teamScores.map(teamData => {
    // For core-values rank tiebreaker, add GP score
    const teamDataWithGP = {
      ...teamData,
      rubricScores: {
        ...teamData.rubricScores,
        'core-values': teamData.rubricScores['core-values'] + teamData.gpScore
      }
    };
    return calculateTeamRanks(teamDataWithGP, teamScores, picklists);
  });
}

/**
 * Fetches judging category picklists for deliberations
 */
async function fetchPicklists(
  divisionId: string
): Promise<Partial<Record<JudgingCategory, string[]>>> {
  const categories: JudgingCategory[] = ['innovation-project', 'robot-design', 'core-values'];
  const picklists: Partial<Record<JudgingCategory, string[]>> = {};

  for (const category of categories) {
    const deliberation = await db.raw.mongo
      .collection('judging_deliberations')
      .findOne({ divisionId, category });

    if (deliberation && Array.isArray(deliberation.picklist)) {
      picklists[category] = deliberation.picklist;
    } else {
      picklists[category] = [];
    }
  }

  return picklists;
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

/**
 * Updates final deliberation with advancing team IDs and publishes Redis event
 */
async function updateFinalDeliberationAwards(
  divisionId: string,
  advancingTeamIds: string[]
): Promise<void> {
  const deliberation = await db.finalDeliberations.byDivision(divisionId).get();
  if (!deliberation) return;

  const updatedDeliberation = await db.finalDeliberations.byDivision(divisionId).update({
    awards: {
      ...deliberation.awards,
      advancement: advancingTeamIds
    }
  });

  if (!updatedDeliberation) return;

  // Publish Redis event
  const pubSub = getRedisPubSub();
  await pubSub.publish(divisionId, RedisEventTypes.FINAL_DELIBERATION_UPDATED, {
    divisionId,
    awards: updatedDeliberation.awards
  });
}
