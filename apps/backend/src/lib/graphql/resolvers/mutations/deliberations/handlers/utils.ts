import { Scoresheet, JudgingCategory } from '@lems/database';
import { rubrics } from '@lems/shared/rubrics';
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
  const scoresheets = await db.scoresheets.byDivision(divisionId).getAll();

  return teams.map(team => ({
    teamId: team.id,
    teamNumber: team.number,
    rubricScores: calculateRubricScores(team.id, rubrics),
    gpScore: calculateGPScore(team.id, scoresheets),
    robotGameScores: scoresheets
      .filter(s => s.teamId === team.id && s.stage === 'RANKING' && s.status === 'submitted')
      .map(s => s.data?.score || 0)
  }));
}

/**
 * Returns core values field names
 */

function getCoreValuesFieldNames(): string[] {
  const innovationProjectSchema = rubrics['innovation-project'];
  const robotDesignSchema = rubrics['robot-design'];
  const coreValuesFields: string[] = [];

  innovationProjectSchema.sections.forEach(section => {
    section.fields.forEach(field => {
      if (field.coreValues) coreValuesFields.push(`IP-${field.id}`);
    });
  });
  robotDesignSchema.sections.forEach(section => {
    section.fields.forEach(field => {
      if (field.coreValues) coreValuesFields.push(`RD-${field.id}`);
    });
  });
  return coreValuesFields;
}

/**
 * Calculates rubric field scores for a specific team
 */
function calculateRubricScores(
  teamId: string,
  teamRubrics: Array<{
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

  const rubricsForTeam = teamRubrics.filter(r => r.teamId === teamId);
  rubricsForTeam.forEach(rubric => {
    if (rubric.category === 'core-values') {
      let coreValuesScore = 0;
      const innovationProjectRubric = rubricsForTeam.find(r => r.category === 'innovation-project');
      const robotDesignRubric = rubricsForTeam.find(r => r.category === 'robot-design');
      const coreValuesFieldNames = getCoreValuesFieldNames();

      if (innovationProjectRubric?.data?.fields) {
        Object.entries(innovationProjectRubric.data.fields).forEach(([key, field]) => {
          if (coreValuesFieldNames.includes(`IP-${key}`)) coreValuesScore += field.value ?? 0;
        });
      }
      if (robotDesignRubric?.data?.fields) {
        Object.entries(robotDesignRubric.data.fields).forEach(([key, field]) => {
          if (coreValuesFieldNames.includes(`RD-${key}`)) coreValuesScore += field.value ?? 0;
        });
      }
      rubricScores['core-values'] = coreValuesScore;
      return;
    }
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
    .filter(s => s.teamId === teamId && s.stage === 'RANKING')
    .reduce((sum, sheet) => {
      return sum + (sheet.data?.gp?.value ?? 3);
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

  // Calculate modified scores for all teams first (add GP score to core-values)
  const teamScoresWithGP = teamScores.map(teamData => ({
    ...teamData,
    rubricScores: {
      ...teamData.rubricScores,
      'core-values': teamData.rubricScores['core-values'] + teamData.gpScore
    }
  }));

  return teamScoresWithGP.map(teamData => {
    const teamDataCopy = structuredClone(teamData);
    const teamScoresWithGPCopy = structuredClone(teamScoresWithGP);
    return calculateTeamRanks(teamDataCopy, teamScoresWithGPCopy, picklists);
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
    const deliberation = await db.judgingDeliberations
      .byDivision(divisionId)
      .getByCategory(category);

    if (deliberation && Array.isArray(deliberation.picklist)) {
      picklists[category] = deliberation.picklist;
    } else {
      throw new Error(`Missing picklist for category ${category} in division ${divisionId}`);
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
