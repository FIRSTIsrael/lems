import { RedisEventTypes } from '@lems/types/api/lems/redis';
import {
  createSubscriptionIterator,
  SubscriptionResult,
  BaseSubscriptionArgs,
  isGapMarker
} from '../base-subscription';
import { extractEventBase } from './utils';

type ScoresheetMissionClauseUpdatedEvent = {
  scoresheetId: string;
  missionId: string;
  clauseIndex: number;
  clauseValue: boolean | string | number | null;
  version: number;
};

type ScoresheetStatusUpdatedEvent = {
  scoresheetId: string;
  status: string;
  version: number;
};

type ScoresheetGPUpdatedEvent = {
  scoresheetId: string;
  gpValue: number | null;
  notes?: string;
  version: number;
};

type ScoresheetEscalatedUpdatedEvent = {
  scoresheetId: string;
  escalated: boolean;
  version: number;
};

type ScoresheetUpdatedEventType =
  | ScoresheetMissionClauseUpdatedEvent
  | ScoresheetStatusUpdatedEvent
  | ScoresheetGPUpdatedEvent
  | ScoresheetEscalatedUpdatedEvent;

async function processScoresheetUpdatedEvent(
  event: Record<string, unknown>
): Promise<SubscriptionResult<ScoresheetUpdatedEventType>> {
  if (isGapMarker(event.data)) {
    return event.data;
  }

  const { eventData, scoresheetId, version } = extractEventBase(event);

  if (!scoresheetId) {
    return null;
  }

  if ('missionId' in eventData && 'clauseIndex' in eventData && 'clauseValue' in eventData) {
    const missionId = (eventData.missionId as string) || '';
    const clauseIndex = (eventData.clauseIndex as number) ?? -1;
    const clauseValue = eventData.clauseValue as boolean | string | number | null;

    return missionId !== '' && clauseIndex >= 0
      ? ({
          scoresheetId,
          missionId,
          clauseIndex,
          clauseValue,
          version
        } as ScoresheetMissionClauseUpdatedEvent)
      : null;
  }

  if ('status' in eventData && !('escalated' in eventData)) {
    const status = (eventData.status as string) || '';
    return status ? ({ scoresheetId, status, version } as ScoresheetStatusUpdatedEvent) : null;
  }

  if ('gp' in eventData) {
    const gp = eventData.gp as Record<string, unknown>;
    return gp
      ? ({
          scoresheetId,
          gpValue: (gp.value as number | null) ?? null,
          notes: (gp.notes as string) || undefined,
          version
        } as ScoresheetGPUpdatedEvent)
      : null;
  }

  if ('escalated' in eventData) {
    const escalated = (eventData.escalated as boolean) ?? false;
    return { scoresheetId, escalated, version } as ScoresheetEscalatedUpdatedEvent;
  }

  return null;
}

export const scoresheetUpdatedResolver = {
  subscribe: (_root: unknown, args: BaseSubscriptionArgs & Record<string, unknown>) => {
    const divisionId = args.divisionId as string;
    if (!divisionId) throw new Error('divisionId is required');
    return createSubscriptionIterator(
      divisionId,
      RedisEventTypes.SCORESHEET_UPDATED,
      (args.lastSeenVersion as number) || 0
    );
  },
  resolve: processScoresheetUpdatedEvent,
  resolveType: (obj: unknown): string => {
    const event = obj as Record<string, unknown>;

    if ('missionId' in event && 'clauseIndex' in event) {
      return 'ScoresheetMissionClauseUpdated';
    }

    if ('status' in event && !('escalated' in event)) {
      return 'ScoresheetStatusUpdated';
    }

    if ('gpValue' in event || 'notes' in event) {
      return 'ScoresheetGPUpdated';
    }

    if ('escalated' in event) {
      return 'ScoresheetEscalatedUpdated';
    }

    throw new Error(
      `Unable to determine type for scoresheet updated event: ${JSON.stringify(event)}`
    );
  }
};
