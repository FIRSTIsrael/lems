import { WithId, ObjectId } from 'mongodb';
import {
  JudgingCategory,
  JudgingRoom,
  JudgingSession,
  Rubric,
  Team,
  Scoresheet,
  CoreValuesForm,
  CVFormCategoryNames,
  CoreValuesAwards,
  JudgingCategoryTypes
} from '@lems/types';
import { sum, average, compareScoreArrays, rankArray } from '@lems/utils/arrays';

export interface DeliberationTeam extends WithId<Team> {
  room: WithId<JudgingRoom>;
  scores: Record<JudgingCategory, number>;
  normalizedScores: Record<JudgingCategory, number>;
  robotGameScores: Array<number>;
  maxRobotGameScore: number;
  robotConsistency: number;
  gpScores: Array<{ round: number; score: number }>;
  totalScore: number;
  normalizedTotalScore: number;
  ranks: Record<JudgingCategory | 'robot-game', number>;
  totalRank: number;
  rubricFields: { [key in JudgingCategory]: { [key: string]: number } };
  cvFormSeverities: Array<CVFormCategoryNames>;
  optionalAwardNominations: { [key in CoreValuesAwards]?: boolean };
  rubricIds: { [key in JudgingCategory]: ObjectId };
}

const getRoomFactors = (roomScores: Array<any>) => {
  const result: Record<string, Record<string, number>> = {};
  [...JudgingCategoryTypes, 'average'].forEach(category => {
    const averageScore = average(roomScores.map(room => room[category]));
    result[category] = roomScores.reduce(
      (acc, current) => ({ ...acc, [current.roomId]: averageScore / current[category] }),
      {}
    );
  });
  return result;
};

const getRubricScores = (
  teamRubrics: Array<WithId<Rubric<JudgingCategory>>>,
  gpScores: Array<{ round: number; score: number }>
): Record<JudgingCategory, number> =>
  teamRubrics.reduce(
    (acc, rubric) => {
      const category = rubric.category;
      const values = rubric.data?.values || {};
      let score = Object.values(values).reduce((acc, current) => acc + current.value, 0);
      if (category === 'core-values') {
        gpScores.forEach(gp => (score += gp.score));
      }
      return { ...acc, [category]: score };
    },
    {} as Record<JudgingCategory, number>
  );

const getRubricFields = (
  teamRubrics: Array<WithId<Rubric<JudgingCategory>>>
): { [key in JudgingCategory]: { [key: string]: number } } =>
  teamRubrics.reduce(
    (acc, rubric) => {
      const category = rubric.category;
      const values = rubric.data?.values || {};
      const rowValues: { [key: string]: number } = {};
      Object.entries(values).forEach(([key, entry]) => {
        rowValues[key] = entry.value;
      });
      return { ...acc, [category]: rowValues };
    },
    {} as { [key in JudgingCategory]: { [key: string]: number } }
  );

export const useDeliberationTeams = (
  teams: Array<WithId<Team>>,
  sessions: Array<WithId<JudgingSession>>,
  rooms: Array<WithId<JudgingRoom>>,
  rubrics: Array<WithId<Rubric<JudgingCategory>>>,
  scoresheets: Array<WithId<Scoresheet>>,
  cvForms: Array<WithId<CoreValuesForm>>,
  roomScores?: Array<unknown>,
  categoryRanks?: { [key in JudgingCategory]: Array<ObjectId> },
  robotConsistency?: Array<{ relStdDev: number }>
) => {
  let roomFactors: Record<string, Record<string, number>> = {};
  if (roomScores) roomFactors = getRoomFactors(roomScores);

  const teamsWithInfo: Array<DeliberationTeam> = teams
    .map(team => {
      const teamSession = sessions.find(session => session.teamId === team._id);
      if (!teamSession) return undefined;

      const room = rooms.find(room => room._id === teamSession.roomId);
      if (!room) return undefined;

      const teamRubrics = rubrics.filter(rubric => rubric.teamId === team._id);
      const rubricIds = teamRubrics.reduce(
        (acc, rubric) => ({ ...acc, [rubric.category]: rubric._id }),
        {} as { [key in JudgingCategory]: ObjectId }
      );
      const teamScoresheets = scoresheets.filter(
        scoresheet => scoresheet.teamId === team._id && scoresheet.stage === 'ranking'
      );
      const robotGameScores = teamScoresheets.map(scoresheet => scoresheet.data?.score || 0);
      const maxRobotGameScore = Math.max(...robotGameScores);
      const gpScores = teamScoresheets.map(scoresheet => ({
        round: scoresheet.round,
        score: scoresheet.data?.gp?.value || 3
      }));

      const rubricFields = getRubricFields(teamRubrics);
      const scores = getRubricScores(teamRubrics, gpScores);
      const totalScore = Object.values(scores).reduce((acc, current) => acc + current, 0);

      const optionalAwardNominations: { [key in CoreValuesAwards]?: boolean } =
        teamRubrics.find(rubric => rubric.category === 'core-values')?.data?.awards ?? {};

      const cvFormSeverities = cvForms
        .filter(cvform => cvform.demonstratorAffiliation?._id.toString() === team?._id.toString())
        .map(cvForm => cvForm.severity);

      const normalizedScores = { ...scores };
      if (roomFactors) {
        JudgingCategoryTypes.forEach(category => {
          const normalized = normalizedScores[category] * roomFactors[category][String(room._id)];
          normalizedScores[category] = Number(normalized.toFixed(2));
        });
      }

      let normalizedTotalScore = totalScore;
      if (roomFactors) {
        const normalized = totalScore * roomFactors.average[String(room._id)];
        normalizedTotalScore = Number(normalized.toFixed(2));
      }

      const stdDev = robotConsistency?.find((row: any) => row.id === team._id)?.relStdDev;
      let consistency = stdDev === undefined ? 0 : 100 - stdDev;
      consistency = Number(consistency.toFixed(2));

      return {
        ...team,
        room,
        robotGameScores,
        maxRobotGameScore,
        robotConsistency: consistency,
        gpScores,
        scores,
        normalizedScores,
        totalScore,
        normalizedTotalScore,
        rubricIds,
        rubricFields,
        optionalAwardNominations,
        cvFormSeverities,
        ranks: { 'core-values': 0, 'innovation-project': 0, 'robot-design': 0, 'robot-game': 0 },
        totalRank: 0
      };
    })
    .filter(team => team !== undefined);

  if (!categoryRanks) return teamsWithInfo;
  // This code is complicated and unreadable, but here's what it does:
  // If a team was in a picklist their rank for that category matches the picklist.
  // If not, their rank is based on their score. Ties are accounted for by shifting everyone down.
  const nonDeliberatedRanks = [...JudgingCategoryTypes, 'robot-game'].reduce(
    (acc, category) => {
      if (category === 'robot-game') {
        const ranks: Array<DeliberationTeam> = [...teamsWithInfo].sort((a, b) =>
          compareScoreArrays(a.robotGameScores, b.robotGameScores)
        );
        const ranksWithRg: Array<DeliberationTeam & { rgRank: number }> = rankArray(
          ranks,
          i => sum(i.robotGameScores),
          'rgRank'
        );
        acc[category] = ranksWithRg.map(team => ({ teamId: team._id, rank: team.rgRank }));
      } else {
        const _category = category as JudgingCategory;
        const ranks: Array<DeliberationTeam> = [...teamsWithInfo]
          .filter(team => !categoryRanks[_category].includes(team._id))
          .sort((a, b) => b.scores[_category] - a.scores[_category]);
        const ranksWithCategory: Array<DeliberationTeam & { categoryRank: number }> = rankArray(
          ranks,
          i => i.scores[_category],
          'categoryRank'
        );
        acc[_category] = ranksWithCategory.map(team => {
          const teamRank =
            ranks.findIndex(rankedTeam => rankedTeam._id === team._id) +
            categoryRanks[_category].length;
          return { teamId: team._id, rank: teamRank };
        });
      }
      return acc;
    },
    {} as { [key: string]: Array<{ teamId: ObjectId; rank: number }> }
  );

  teamsWithInfo.forEach(team => {
    team.ranks = [...JudgingCategoryTypes, 'robot-game'].reduce(
      (acc, category) => {
        const _category = category as JudgingCategory | 'robot-game';

        if (_category === 'robot-game') {
          const rank = nonDeliberatedRanks['robot-game'].find(
            entry => entry.teamId === team._id
          )?.rank;
          if (rank) acc[_category] = rank;
          return acc;
        }

        const deliberationRank = categoryRanks[_category].findIndex(id => id === team._id);
        if (deliberationRank >= 0) {
          acc[_category] = deliberationRank + 1;
          return acc;
        }

        const rank = nonDeliberatedRanks[_category].find(entry => entry.teamId === team._id)?.rank;
        if (rank) acc[_category] = rank + 1;
        return acc;
      },
      {} as { [key in JudgingCategory | 'robot-game']: number }
    );
    team.totalRank = average(Object.values(team.ranks));
  });

  return teamsWithInfo;
};
