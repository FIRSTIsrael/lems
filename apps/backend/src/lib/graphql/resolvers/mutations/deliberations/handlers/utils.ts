import { Scoresheet, JudgingCategory } from '@lems/database';
import { calculateTeamRanks, TeamWithRanks } from '@lems/shared/deliberation';
import { RedisEventTypes } from '@lems/types/api/lems/redis';
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
 * Calculates scores for all teams (rubric + GP scores)
 */
export async function calculateAllTeamScores(
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
function calculateGPScore(teamId: string, scoresheets: Scoresheet[]): number {
  return scoresheets
    .filter(s => s.teamId === teamId)
    .reduce((sum, sheet) => {
      return sum + (sheet.data?.gp?.value ?? 0);
    }, 0);
}

/**
 * Ranks teams based on their scores and picklists
 */
export async function rankTeams(
  teamScores: TeamScoreData[],
  divisionId: string
): Promise<TeamWithRanks[]> {
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

/**
 * Updates final deliberation with advancing team IDs and publishes Redis event
 */
export async function updateFinalDeliberationAwards(divisionId: string): Promise<void> {
  const deliberation = await db.finalDeliberations.byDivision(divisionId).get();
  if (!deliberation) return;

  const updatedDeliberation = await db.finalDeliberations.byDivision(divisionId).update({
    awards: {
      ...deliberation.awards
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
