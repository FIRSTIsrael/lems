'use client';

import useSWR from 'swr';
import {
  InsightsEvent,
  InsightsEventsResponseSchema,
  InsightsExplorerQuery,
  InsightsExplorerResponseSchema,
  InsightsExplorerResult,
  InsightsJudging,
  InsightsJudgingResponseSchema,
  InsightsOverview,
  InsightsOverviewResponseSchema,
  InsightsRobotGame,
  InsightsRobotGameResponseSchema,
  InsightsStage
} from '@lems/types/api/admin';

const base = (divisionId: string) => `/admin/insights/divisions/${divisionId}`;

export const useInsightsEvents = () =>
  useSWR<InsightsEvent[]>(['/admin/insights/events', InsightsEventsResponseSchema]);

export const useOverviewInsights = (divisionId: string) =>
  useSWR<InsightsOverview>([`${base(divisionId)}/overview`, InsightsOverviewResponseSchema]);

export const useRobotGameInsights = (divisionId: string, stage?: InsightsStage) =>
  useSWR<InsightsRobotGame>([
    `${base(divisionId)}/robot-game${stage ? `?stage=${stage}` : ''}`,
    InsightsRobotGameResponseSchema
  ]);

export const useJudgingInsights = (divisionId: string) =>
  useSWR<InsightsJudging>([`${base(divisionId)}/judging`, InsightsJudgingResponseSchema]);

export const useExplorerInsights = (divisionId: string, query: InsightsExplorerQuery | null) => {
  const params = query
    ? new URLSearchParams(
        Object.entries(query).filter((entry): entry is [string, string] => !!entry[1])
      ).toString()
    : null;

  return useSWR<InsightsExplorerResult>(
    params ? [`${base(divisionId)}/explore?${params}`, InsightsExplorerResponseSchema] : null
  );
};
