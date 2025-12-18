import { RedisEventTypes } from '@lems/types/api/lems/redis';
import { ScoresheetClauseValue } from '@lems/shared/scoresheet';
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
  clauseValue: ScoresheetClauseValue;
  score: number;
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

type ScoresheetSignatureUpdatedEvent = {
  scoresheetId: string;
  signature: string | null;
  status: string;
  version: number;
};

type ScoresheetUpdatedEventType =
  | ScoresheetMissionClauseUpdatedEvent
  | ScoresheetStatusUpdatedEvent
  | ScoresheetGPUpdatedEvent
  | ScoresheetEscalatedUpdatedEvent
  | ScoresheetSignatureUpdatedEvent;

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
    const clauseValue = eventData.clauseValue as ScoresheetClauseValue;
    const score = (eventData.score as number) || 0;

    return missionId !== '' && clauseIndex >= 0
      ? ({
          scoresheetId,
          missionId,
          clauseIndex,
          clauseValue,
          score,
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

  if ('signature' in eventData) {
    const signature = (eventData.signature as string) || null;
    const status = (eventData.status as string) || '';

    return status
      ? ({
          scoresheetId,
          signature,
          status,
          version
        } as ScoresheetSignatureUpdatedEvent)
      : null;
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
  resolve: processScoresheetUpdatedEvent
};

/**
 * Type resolver for ScoresheetUpdatedEvent union type
 */
export const ScoresheetUpdatedEventResolver = {
  __resolveType(obj: Record<string, unknown>) {
    if ('missionId' in obj && 'clauseIndex' in obj) return 'ScoresheetMissionClauseUpdated';
    if ('signature' in obj) return 'ScoresheetSignatureUpdated';
    if ('status' in obj && !('escalated' in obj)) return 'ScoresheetStatusUpdated';
    if ('gpValue' in obj || 'notes' in obj) return 'ScoresheetGPUpdated';
    if ('escalated' in obj) return 'ScoresheetEscalatedUpdated';
    return null;
  }
};
