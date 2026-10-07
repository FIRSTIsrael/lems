import { z } from 'zod';

export const INSIGHTS_JUDGING_CATEGORIES = [
  'innovation-project',
  'robot-design',
  'core-values'
] as const;

export type InsightsJudgingCategory = (typeof INSIGHTS_JUDGING_CATEGORIES)[number];

export const INSIGHTS_STAGES = ['PRACTICE', 'RANKING'] as const;

export type InsightsStage = (typeof INSIGHTS_STAGES)[number];

const nullableNumber = z.number().nullable();

export const InsightsSummarySchema = z.object({
  count: z.number(),
  average: nullableNumber,
  median: nullableNumber,
  min: nullableNumber,
  max: nullableNumber,
  stdDev: nullableNumber
});

export type InsightsSummary = z.infer<typeof InsightsSummarySchema>;

export const InsightsTeamRefSchema = z.object({
  teamId: z.string(),
  number: z.number(),
  name: z.string(),
  affiliation: z.string()
});

export type InsightsTeamRef = z.infer<typeof InsightsTeamRefSchema>;

export const InsightsLinearRegressionSchema = z.object({
  slope: z.number(),
  intercept: z.number(),
  r: z.number(),
  r2: z.number(),
  n: z.number()
});

export type InsightsLinearRegression = z.infer<typeof InsightsLinearRegressionSchema>;

const categoryScoresShape = {
  'innovation-project': nullableNumber,
  'robot-design': nullableNumber,
  'core-values': nullableNumber
};

// ---------------------------------------------------------------------------
// Events
// ---------------------------------------------------------------------------

export const InsightsEventSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  startDate: z.coerce.date(),
  seasonId: z.string(),
  seasonName: z.string().nullable(),
  completed: z.boolean(),
  divisions: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      color: z.string(),
      futureEdition: z.boolean()
    })
  )
});

export type InsightsEvent = z.infer<typeof InsightsEventSchema>;

export const InsightsEventsResponseSchema = z.array(InsightsEventSchema);

// ---------------------------------------------------------------------------
// Overview dashboard
// ---------------------------------------------------------------------------

const progressSchema = z.object({ completed: z.number(), total: z.number() });

export const InsightsOverviewTeamSchema = InsightsTeamRefSchema.extend({
  rank: nullableNumber,
  maxScore: nullableNumber,
  averageScore: nullableNumber,
  scores: z.array(z.number()),
  ...categoryScoresShape,
  judgingAverage: nullableNumber,
  gpAverage: nullableNumber
});

export type InsightsOverviewTeam = z.infer<typeof InsightsOverviewTeamSchema>;

export const InsightsOverviewResponseSchema = z.object({
  teamCount: z.number(),
  matches: progressSchema,
  sessions: progressSchema,
  scoresheets: progressSchema,
  rubrics: progressSchema,
  robotGame: InsightsSummarySchema,
  judging: InsightsSummarySchema,
  averageMatchDelay: nullableNumber,
  averageSessionDelay: nullableNumber,
  teams: z.array(InsightsOverviewTeamSchema)
});

export type InsightsOverview = z.infer<typeof InsightsOverviewResponseSchema>;

// ---------------------------------------------------------------------------
// Robot game dashboard
// ---------------------------------------------------------------------------

export const InsightsCycleTimeSchema = z.object({
  stage: z.enum(INSIGHTS_STAGES),
  count: z.number(),
  average: nullableNumber,
  median: nullableNumber,
  min: nullableNumber,
  max: nullableNumber,
  percentile95: nullableNumber,
  averageDelay: nullableNumber
});

export type InsightsCycleTime = z.infer<typeof InsightsCycleTimeSchema>;

export const InsightsRobotGameResponseSchema = z.object({
  scores: InsightsSummarySchema,
  topScores: InsightsSummarySchema,
  highestScore: InsightsTeamRefSchema.extend({ score: z.number() }).nullable(),
  scoresByRound: z.array(
    z.object({
      stage: z.enum(INSIGHTS_STAGES),
      round: z.number(),
      count: z.number(),
      average: nullableNumber,
      median: nullableNumber,
      max: nullableNumber
    })
  ),
  tables: z.array(
    z.object({
      tableId: z.string(),
      name: z.string(),
      count: z.number(),
      average: nullableNumber,
      median: nullableNumber
    })
  ),
  missions: z.array(
    z.object({
      missionId: z.string(),
      attempts: z.number(),
      successRate: nullableNumber,
      averagePoints: nullableNumber
    })
  ),
  inspection: z
    .object({
      successRate: nullableNumber,
      teamCount: z.number(),
      failures: z.array(InsightsTeamRefSchema.extend({ count: z.number() }))
    })
    .nullable(),
  precisionTokens: z
    .array(z.object({ tokens: z.number(), count: z.number(), averageScore: nullableNumber }))
    .nullable(),
  consistency: z.object({
    averageRelStdDev: nullableNumber,
    rows: z.array(
      InsightsTeamRefSchema.extend({
        scores: z.array(z.number()),
        average: z.number(),
        stdDev: z.number(),
        relStdDev: nullableNumber
      })
    )
  }),
  cycleTimes: z.array(InsightsCycleTimeSchema),
  matchDelays: z.array(
    z.object({
      matchId: z.string(),
      stage: z.enum(INSIGHTS_STAGES),
      round: z.number(),
      number: z.number(),
      scheduledTime: z.coerce.date(),
      delay: z.number()
    })
  )
});

export type InsightsRobotGame = z.infer<typeof InsightsRobotGameResponseSchema>;

// ---------------------------------------------------------------------------
// Judging dashboard
// ---------------------------------------------------------------------------

export const InsightsRobotCorrelationPointSchema = InsightsTeamRefSchema.extend({
  robotDesign: z.number(),
  robotGame: z.number(),
  predicted: nullableNumber,
  residual: nullableNumber
});

export type InsightsRobotCorrelationPoint = z.infer<typeof InsightsRobotCorrelationPointSchema>;

export const InsightsJudgingResponseSchema = z.object({
  scores: InsightsSummarySchema,
  highestTeamAverage: InsightsTeamRefSchema.extend({ value: z.number() }).nullable(),
  categories: z.array(
    z.object({
      category: z.enum(INSIGHTS_JUDGING_CATEGORIES),
      count: z.number(),
      average: nullableNumber,
      median: nullableNumber
    })
  ),
  rooms: z.array(
    z.object({
      roomId: z.string(),
      name: z.string(),
      teamCount: z.number(),
      ...categoryScoresShape,
      average: nullableNumber,
      averageDelay: nullableNumber
    })
  ),
  sessionDelay: z.object({
    average: nullableNumber,
    best: z.object({ roomId: z.string(), name: z.string(), average: z.number() }).nullable(),
    worst: z.object({ roomId: z.string(), name: z.string(), average: z.number() }).nullable()
  }),
  nominations: z.object({
    teamsNominated: z.number(),
    awards: z.array(z.object({ award: z.string(), count: z.number() }))
  }),
  robotCorrelation: z.object({
    points: z.array(InsightsRobotCorrelationPointSchema),
    regression: InsightsLinearRegressionSchema.nullable()
  }),
  fieldDistributions: z.array(
    z.object({
      category: z.enum(INSIGHTS_JUDGING_CATEGORIES),
      fieldId: z.string(),
      average: nullableNumber,
      counts: z.array(z.number()).length(4)
    })
  )
});

export type InsightsJudging = z.infer<typeof InsightsJudgingResponseSchema>;

// ---------------------------------------------------------------------------
// Explorer (structured free queries)
// ---------------------------------------------------------------------------

export const INSIGHTS_EXPLORER_METRICS = [
  'robot-game-score',
  'mission-points',
  'gp-score',
  'rubric-score',
  'match-delay',
  'session-delay'
] as const;

export type InsightsExplorerMetric = (typeof INSIGHTS_EXPLORER_METRICS)[number];

export const INSIGHTS_EXPLORER_DIMENSIONS = [
  'none',
  'team',
  'table',
  'room',
  'stage',
  'round',
  'category'
] as const;

export type InsightsExplorerDimension = (typeof INSIGHTS_EXPLORER_DIMENSIONS)[number];

export const INSIGHTS_EXPLORER_AGGREGATIONS = [
  'average',
  'median',
  'min',
  'max',
  'sum',
  'count',
  'std-dev'
] as const;

export type InsightsExplorerAggregation = (typeof INSIGHTS_EXPLORER_AGGREGATIONS)[number];

/** Which dimensions each metric can be grouped by. */
export const INSIGHTS_METRIC_DIMENSIONS: Record<
  InsightsExplorerMetric,
  readonly InsightsExplorerDimension[]
> = {
  'robot-game-score': ['none', 'team', 'table', 'stage', 'round'],
  'mission-points': ['none', 'team', 'table', 'stage', 'round'],
  'gp-score': ['none', 'team', 'table', 'stage', 'round'],
  'rubric-score': ['none', 'team', 'room', 'category'],
  'match-delay': ['none', 'stage', 'round'],
  'session-delay': ['none', 'room']
};

export const InsightsExplorerQuerySchema = z
  .object({
    metric: z.enum(INSIGHTS_EXPLORER_METRICS),
    groupBy: z.enum(INSIGHTS_EXPLORER_DIMENSIONS).default('none'),
    aggregation: z.enum(INSIGHTS_EXPLORER_AGGREGATIONS).default('average'),
    stage: z.enum(INSIGHTS_STAGES).optional(),
    category: z.enum(INSIGHTS_JUDGING_CATEGORIES).optional(),
    mission: z.string().optional(),
    field: z.string().optional()
  })
  .refine(query => INSIGHTS_METRIC_DIMENSIONS[query.metric].includes(query.groupBy), {
    message: 'Invalid groupBy for metric',
    path: ['groupBy']
  })
  .refine(query => query.metric !== 'mission-points' || !!query.mission, {
    message: 'mission is required for mission-points',
    path: ['mission']
  })
  .refine(query => !query.field || !!query.category, {
    message: 'category is required when field is set',
    path: ['field']
  });

export type InsightsExplorerQuery = z.infer<typeof InsightsExplorerQuerySchema>;

export const InsightsExplorerResponseSchema = z.object({
  dimension: z.enum(INSIGHTS_EXPLORER_DIMENSIONS),
  rows: z.array(
    z.object({
      key: z.string(),
      label: z.string(),
      value: nullableNumber,
      count: z.number()
    })
  ),
  total: InsightsSummarySchema
});

export type InsightsExplorerResult = z.infer<typeof InsightsExplorerResponseSchema>;
