'use client';

import { GridSize } from '@mui/material';
import { WidgetProps } from './common';
import { OverviewStatsWidget, TeamsTableWidget } from './overview-widgets';
import {
  CycleTimesWidget,
  InspectionWidget,
  MatchDelaysWidget,
  MissionSuccessWidget,
  PrecisionTokensWidget,
  RobotConsistencyWidget,
  RobotGameStatsWidget,
  ScoresByRoundWidget,
  ScoresPerTableWidget
} from './robot-game-widgets';
import {
  AwardNominationsWidget,
  CategoryScoresWidget,
  FieldDistributionWidget,
  JudgingStatsWidget,
  RobotCorrelationWidget,
  RoomDelaysWidget,
  RoomScoresWidget
} from './judging-widgets';

type ResponsiveSize = { xs?: GridSize; md?: GridSize; lg?: GridSize };

interface WidgetDefinition {
  component: React.FC<WidgetProps>;
  size: ResponsiveSize;
}

const FULL: ResponsiveSize = { xs: 12 };
const HALF: ResponsiveSize = { xs: 12, lg: 6 };

/**
 * All available insights widgets. Every widget fetches its own data (deduplicated by SWR),
 * so they can be freely composed into dashboards - and later into user-customized layouts.
 */
export const INSIGHTS_WIDGETS = {
  'overview-stats': { component: OverviewStatsWidget, size: FULL },
  'teams-table': { component: TeamsTableWidget, size: FULL },
  'robot-game-stats': { component: RobotGameStatsWidget, size: FULL },
  'scores-by-round': { component: ScoresByRoundWidget, size: HALF },
  'scores-per-table': { component: ScoresPerTableWidget, size: HALF },
  'mission-success': { component: MissionSuccessWidget, size: FULL },
  inspection: { component: InspectionWidget, size: HALF },
  'precision-tokens': { component: PrecisionTokensWidget, size: HALF },
  'cycle-times': { component: CycleTimesWidget, size: HALF },
  'match-delays': { component: MatchDelaysWidget, size: HALF },
  'robot-consistency': { component: RobotConsistencyWidget, size: FULL },
  'judging-stats': { component: JudgingStatsWidget, size: FULL },
  'category-scores': { component: CategoryScoresWidget, size: HALF },
  'room-delays': { component: RoomDelaysWidget, size: HALF },
  'room-scores': { component: RoomScoresWidget, size: FULL },
  'robot-correlation': { component: RobotCorrelationWidget, size: FULL },
  'field-distribution': { component: FieldDistributionWidget, size: HALF },
  'award-nominations': { component: AwardNominationsWidget, size: HALF }
} satisfies Record<string, WidgetDefinition>;

export type InsightsWidgetId = keyof typeof INSIGHTS_WIDGETS;

export const INSIGHTS_DASHBOARDS = {
  overview: ['overview-stats', 'teams-table'],
  'robot-game': [
    'robot-game-stats',
    'inspection',
    'cycle-times',
    'scores-by-round',
    'scores-per-table',
    'mission-success',
    'precision-tokens',
    'match-delays',
    'robot-consistency'
  ],
  judging: [
    'judging-stats',
    'category-scores',
    'room-delays',
    'room-scores',
    'robot-correlation',
    'field-distribution',
    'award-nominations'
  ]
} satisfies Record<string, InsightsWidgetId[]>;

export type InsightsDashboardId = keyof typeof INSIGHTS_DASHBOARDS;
