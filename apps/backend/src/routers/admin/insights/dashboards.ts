import {
  compareRobotGameScores,
  getRankingStrategy,
  getRobotGameHeadlineScore
} from '@lems/shared/utils';
import { ScoresheetError } from '@lems/shared/scoresheet';
import { getCvFieldIds } from '@lems/shared/rubrics';
import {
  INSIGHTS_JUDGING_CATEGORIES,
  INSIGHTS_STAGES,
  InsightsCycleTime,
  InsightsJudging,
  InsightsOverview,
  InsightsRobotGame,
  InsightsStage
} from '@lems/types/api/admin';
import { DivisionInsightsData, ScoresheetRecord } from './data';
import {
  groupBy,
  linearRegression,
  max,
  mean,
  median,
  percentile,
  stdDev,
  summarize
} from './stats';

const INSPECTION_MISSION_ID = 'eib';
/** Precision Tokens in Founders Edition scoresheets, Penalties in the Future Edition scoresheet. */
const PT_MISSION_ID = 'pt';
/** Scoresheet entries that are not missions teams attempt (inspection, tokens, penalties). */
const NON_MISSION_IDS = [INSPECTION_MISSION_ID, PT_MISSION_ID];

/**
 * Calculates the points earned in a single mission.
 * Returns null if the clause combination is invalid according to the scoresheet schema.
 */
export const getMissionPoints = (
  data: DivisionInsightsData,
  scoresheet: ScoresheetRecord,
  missionId: string
): number | null => {
  const mission = data.scoresheetSchema.missions.find(m => m.id === missionId);
  const clauses = scoresheet.missions[missionId];
  if (!mission || !clauses) return null;
  try {
    return mission.calculation(...clauses);
  } catch (error) {
    if (error instanceof ScoresheetError) return null;
    throw error;
  }
};

const filterByStage = (scoresheets: ScoresheetRecord[], stage?: InsightsStage) =>
  stage ? scoresheets.filter(s => s.stage === stage) : scoresheets;

const teamRef = (data: DivisionInsightsData, teamId: string) => data.teams.get(teamId)!;

/** A team's ranking score: best score in Founders Edition, average score in Future Edition. */
const rankingScore = (data: DivisionInsightsData, scores: number[]): number | null =>
  scores.length === 0 ? null : getRobotGameHeadlineScore(scores, getRankingStrategy(data.edition));

// ---------------------------------------------------------------------------
// Overview
// ---------------------------------------------------------------------------

export const computeOverview = (data: DivisionInsightsData): InsightsOverview => {
  const ranking = filterByStage(data.scoresheets, 'RANKING');
  const scoresByTeam = groupBy(ranking, s => s.teamId);
  const rubricsByTeam = groupBy(data.rubrics, r => r.teamId);

  const strategy = getRankingStrategy(data.edition);
  const compare = (a: number[], b: number[]) => compareRobotGameScores(a, b, strategy);
  const rankedTeams = [...scoresByTeam.entries()]
    .map(([teamId, sheets]) => ({ teamId, scores: sheets.map(s => s.score) }))
    .sort((a, b) => compare(a.scores, b.scores));
  const ranks = new Map<string, number>();
  rankedTeams.forEach((team, index) => {
    const previous = rankedTeams[index - 1];
    const tied = previous && compare(team.scores, previous.scores) === 0;
    ranks.set(team.teamId, tied ? ranks.get(previous.teamId)! : index + 1);
  });

  const teams = [...data.teams.values()].map(team => {
    const sheets = scoresByTeam.get(team.teamId) ?? [];
    const scores = sheets.map(s => s.score);
    const rubrics = rubricsByTeam.get(team.teamId) ?? [];
    const categoryAverage = (category: string) =>
      rubrics.find(r => r.category === category)?.average ?? null;
    const gps = data.scoresheets
      .filter(s => s.teamId === team.teamId && s.gp !== null)
      .map(s => s.gp as number);

    return {
      ...team,
      rank: ranks.get(team.teamId) ?? null,
      maxScore: max(scores),
      averageScore: mean(scores),
      scores,
      'innovation-project': categoryAverage('innovation-project'),
      'robot-design': categoryAverage('robot-design'),
      'core-values': categoryAverage('core-values'),
      judgingAverage: mean(rubrics.map(r => r.average)),
      gpAverage: mean(gps)
    };
  });

  const matchDelays = data.matches.filter(m => m.delay !== null).map(m => m.delay as number);
  const sessionDelays = data.sessions.filter(s => s.delay !== null).map(s => s.delay as number);
  const occupiedSessions = data.sessions.filter(s => s.teamId);

  return {
    teamCount: data.teams.size,
    matches: {
      completed: data.matches.filter(m => m.completed).length,
      total: data.matches.length
    },
    sessions: {
      completed: occupiedSessions.filter(s => s.completed).length,
      total: occupiedSessions.length
    },
    scoresheets: { completed: data.scoresheets.length, total: data.scoresheetTotal },
    rubrics: {
      completed: data.rubrics.filter(r => r.category !== 'core-values').length,
      total: data.rubricTotal
    },
    robotGame: summarize(ranking.map(s => s.score)),
    judging: summarize(data.rubrics.map(r => r.average)),
    averageMatchDelay: mean(matchDelays),
    averageSessionDelay: mean(sessionDelays),
    teams
  };
};

// ---------------------------------------------------------------------------
// Robot game
// ---------------------------------------------------------------------------

const computeCycleTime = (data: DivisionInsightsData, stage: InsightsStage): InsightsCycleTime => {
  const matches = data.matches
    .filter(m => m.stage === stage && m.completed && m.startTime)
    .sort((a, b) => new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime());

  // Cycle time is only meaningful between consecutive matches within the same round
  const cycleTimes: number[] = [];
  for (let i = 1; i < matches.length; i++) {
    const previous = matches[i - 1];
    const current = matches[i];
    if (previous.round !== current.round) continue;
    cycleTimes.push(
      Math.round(
        (new Date(current.startTime!).getTime() - new Date(previous.startTime!).getTime()) / 1000
      )
    );
  }

  return {
    stage,
    count: cycleTimes.length,
    average: mean(cycleTimes),
    median: median(cycleTimes),
    min: cycleTimes.length ? Math.min(...cycleTimes) : null,
    max: max(cycleTimes),
    percentile95: percentile(cycleTimes, 0.95),
    averageDelay: mean(matches.map(m => m.delay as number))
  };
};

export const computeRobotGame = (
  data: DivisionInsightsData,
  stage?: InsightsStage
): InsightsRobotGame => {
  const scoresheets = filterByStage(data.scoresheets, stage);
  const scoresByTeam = groupBy(scoresheets, s => s.teamId);

  const rankingScores = [...scoresByTeam.values()].map(
    sheets =>
      rankingScore(
        data,
        sheets.map(s => s.score)
      ) as number
  );
  const best = scoresheets.reduce<ScoresheetRecord | null>(
    (top, s) => (!top || s.score > top.score ? s : top),
    null
  );

  const scoresByRound = [...groupBy(scoresheets, s => `${s.stage}:${s.round}`).values()]
    .map(sheets => {
      const scores = sheets.map(s => s.score);
      return {
        stage: sheets[0].stage,
        round: sheets[0].round,
        count: scores.length,
        average: mean(scores),
        median: median(scores),
        max: max(scores)
      };
    })
    .sort(
      (a, b) =>
        INSIGHTS_STAGES.indexOf(a.stage) - INSIGHTS_STAGES.indexOf(b.stage) || a.round - b.round
    );

  const tables = [...data.tables.entries()]
    .map(([tableId, name]) => {
      const scores = scoresheets.filter(s => s.tableId === tableId).map(s => s.score);
      return { tableId, name, count: scores.length, average: mean(scores), median: median(scores) };
    })
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));

  const missions = data.scoresheetSchema.missions
    .filter(m => !NON_MISSION_IDS.includes(m.id))
    .map(mission => {
      const points = scoresheets
        .map(s => getMissionPoints(data, s, mission.id))
        .filter((p): p is number => p !== null);
      return {
        missionId: mission.id,
        attempts: points.length,
        successRate: points.length
          ? (points.filter(p => p > 0).length / points.length) * 100
          : null,
        averagePoints: mean(points)
      };
    });

  const hasInspection = data.scoresheetSchema.missions.some(m => m.id === INSPECTION_MISSION_ID);
  const inspectionFailures = [
    ...groupBy(
      scoresheets.filter(s => s.missions[INSPECTION_MISSION_ID]?.[0] === false),
      s => s.teamId
    ).entries()
  ]
    .map(([teamId, sheets]) => ({ ...teamRef(data, teamId), count: sheets.length }))
    .sort((a, b) => b.count - a.count || a.number - b.number);
  const inspectedTeams = scoresByTeam.size;

  // The 'pt' entry is the same clause-per-match distribution in both editions, but it means
  // precision tokens left in Founders Edition and penalties received in Future Edition.
  const ptMission = data.scoresheetSchema.missions.find(m => m.id === PT_MISSION_ID);
  const ptDistribution = [
    ...groupBy(
      scoresheets.filter(s => s.missions[PT_MISSION_ID]?.[0] != null),
      s => String(s.missions[PT_MISSION_ID][0])
    ).entries()
  ].map(([value, sheets]) => ({
    value,
    count: sheets.length,
    averageScore: mean(sheets.map(s => s.score))
  }));
  const ptOptions = ptMission?.clauses[0]?.options ?? [];
  const ptOrder = (value: string) =>
    ptOptions.includes(value) ? ptOptions.indexOf(value) : Number(value);
  ptDistribution.sort((a, b) => ptOrder(a.value) - ptOrder(b.value));

  const precisionTokens =
    ptMission && data.edition === 'founders'
      ? ptDistribution.map(({ value, ...row }) => ({ tokens: Number(value), ...row }))
      : null;
  const penalties =
    ptMission && data.edition === 'future'
      ? ptDistribution.map(({ value, ...row }) => ({ penalties: value, ...row }))
      : null;

  const consistencyRows = [...scoresByTeam.entries()]
    .map(([teamId, sheets]) => {
      const scores = sheets.sort((a, b) => a.round - b.round).map(s => s.score);
      const average = mean(scores) as number;
      const deviation = stdDev(scores) as number;
      return {
        ...teamRef(data, teamId),
        scores,
        average,
        stdDev: deviation,
        relStdDev: average > 0 ? (deviation / average) * 100 : null
      };
    })
    .sort((a, b) => a.number - b.number);

  const matchDelays = data.matches
    .filter(m => m.delay !== null && (!stage || m.stage === stage))
    .sort((a, b) => new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime())
    .map(m => ({
      matchId: m.id,
      stage: m.stage,
      round: m.round,
      number: m.number,
      scheduledTime: m.scheduledTime,
      delay: m.delay as number
    }));

  return {
    scores: summarize(scoresheets.map(s => s.score)),
    rankingScores: summarize(rankingScores),
    highestScore: best ? { ...teamRef(data, best.teamId), score: best.score } : null,
    scoresByRound,
    tables,
    missions,
    inspection: hasInspection
      ? {
          successRate: inspectedTeams
            ? ((inspectedTeams - inspectionFailures.length) / inspectedTeams) * 100
            : null,
          teamCount: inspectedTeams,
          failures: inspectionFailures
        }
      : null,
    precisionTokens,
    penalties,
    consistency: {
      averageRelStdDev: mean(
        consistencyRows.filter(r => r.relStdDev !== null).map(r => r.relStdDev as number)
      ),
      rows: consistencyRows
    },
    cycleTimes: (stage ? [stage] : INSIGHTS_STAGES).map(s => computeCycleTime(data, s)),
    matchDelays
  };
};

// ---------------------------------------------------------------------------
// Judging
// ---------------------------------------------------------------------------

export const computeJudging = (data: DivisionInsightsData): InsightsJudging => {
  const rubricsByTeam = groupBy(data.rubrics, r => r.teamId);

  const highest = [...rubricsByTeam.entries()]
    .map(([teamId, rubrics]) => ({ teamId, value: mean(rubrics.map(r => r.average)) as number }))
    .reduce<{ teamId: string; value: number } | null>(
      (top, team) => (!top || team.value > top.value ? team : top),
      null
    );

  const categories = INSIGHTS_JUDGING_CATEGORIES.map(category => {
    const averages = data.rubrics.filter(r => r.category === category).map(r => r.average);
    return { category, count: averages.length, average: mean(averages), median: median(averages) };
  });

  const rooms = [...data.rooms.entries()]
    .map(([roomId, name]) => {
      const rubrics = data.rubrics.filter(r => r.roomId === roomId);
      const categoryAverage = (category: string) =>
        mean(rubrics.filter(r => r.category === category).map(r => r.average));
      const delays = data.sessions
        .filter(s => s.roomId === roomId && s.delay !== null)
        .map(s => s.delay as number);
      return {
        roomId,
        name,
        teamCount: new Set(rubrics.map(r => r.teamId)).size,
        'innovation-project': categoryAverage('innovation-project'),
        'robot-design': categoryAverage('robot-design'),
        'core-values': categoryAverage('core-values'),
        average: mean(rubrics.map(r => r.average)),
        averageDelay: mean(delays)
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));

  const roomsWithDelay = rooms
    .filter(r => r.averageDelay !== null)
    .map(r => ({ roomId: r.roomId, name: r.name, average: r.averageDelay as number }));
  const bestRoom = roomsWithDelay.reduce<(typeof roomsWithDelay)[number] | null>(
    (top, room) => (!top || Math.abs(room.average) < Math.abs(top.average) ? room : top),
    null
  );
  const worstRoom = roomsWithDelay.reduce<(typeof roomsWithDelay)[number] | null>(
    (top, room) => (!top || room.average > top.average ? room : top),
    null
  );

  const awardCounts = new Map<string, number>();
  for (const awards of data.nominations.values()) {
    for (const award of awards) awardCounts.set(award, (awardCounts.get(award) ?? 0) + 1);
  }

  // Robot design (judging) -> robot game (field) correlation, using each team's ranking score
  const correlationBase = [...data.teams.values()]
    .map(team => {
      const robotDesign = data.rubrics.find(
        r => r.teamId === team.teamId && r.category === 'robot-design'
      )?.average;
      const robotGame = rankingScore(
        data,
        data.scoresheets
          .filter(s => s.teamId === team.teamId && s.stage === 'RANKING')
          .map(s => s.score)
      );
      return { team, robotDesign, robotGame };
    })
    .filter(
      (p): p is typeof p & { robotDesign: number; robotGame: number } =>
        p.robotDesign !== undefined && p.robotGame !== null
    );
  const regression = linearRegression(
    correlationBase.map(p => ({ x: p.robotDesign, y: p.robotGame }))
  );
  const correlationPoints = correlationBase.map(({ team, robotDesign, robotGame }) => {
    const predicted = regression ? regression.slope * robotDesign + regression.intercept : null;
    return {
      ...team,
      robotDesign,
      robotGame,
      predicted,
      residual: predicted === null ? null : robotGame - predicted
    };
  });

  const cvFieldIds = getCvFieldIds(data.edition);
  const schemaFieldIds = {
    'innovation-project': data.rubricsSchema['innovation-project'].sections.flatMap(s =>
      s.fields.map(f => f.id)
    ),
    'robot-design': data.rubricsSchema['robot-design'].sections.flatMap(s =>
      s.fields.map(f => f.id)
    ),
    'core-values': [
      ...cvFieldIds['innovation-project'].map(id => `ip-${id}`),
      ...cvFieldIds['robot-design'].map(id => `rd-${id}`)
    ]
  };

  const fieldDistributions = INSIGHTS_JUDGING_CATEGORIES.flatMap(category => {
    const rubrics = data.rubrics.filter(r => r.category === category);
    const fieldIds = schemaFieldIds[category].filter(id =>
      rubrics.some(r => r.fields[id] !== undefined)
    );
    return fieldIds.map(fieldId => {
      const values = rubrics.map(r => r.fields[fieldId]).filter(v => v !== undefined);
      return {
        category,
        fieldId,
        average: mean(values),
        counts: [1, 2, 3, 4].map(level => values.filter(v => v === level).length)
      };
    });
  });

  return {
    scores: summarize(data.rubrics.map(r => r.average)),
    highestTeamAverage: highest ? { ...teamRef(data, highest.teamId), value: highest.value } : null,
    categories,
    rooms,
    sessionDelay: {
      average: mean(data.sessions.filter(s => s.delay !== null).map(s => s.delay as number)),
      best: bestRoom,
      worst: worstRoom
    },
    nominations: {
      teamsNominated: data.nominations.size,
      awards: [...awardCounts.entries()]
        .map(([award, count]) => ({ award, count }))
        .sort((a, b) => b.count - a.count)
    },
    robotCorrelation: { points: correlationPoints, regression },
    fieldDistributions
  };
};
