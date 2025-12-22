import { RedisEventTypes } from '@lems/types/api/lems/redis';
import { ScoresheetClauseValue } from '@lems/shared/scoresheet';
import {
  createSubscriptionIterator,
  SubscriptionResult,
  BaseSubscriptionArgs
} from '../base-subscription';
import { extractEventBase } from './utils';

type ScoresheetMissionClauseUpdatedEvent = {
  scoresheetId: string;
  missionId: string;
  clauseIndex: number;
  clauseValue: ScoresheetClauseValue;
  score: number;
};

type ScoresheetStatusUpdatedEvent = {
  scoresheetId: string;
  status: string;
};

type ScoresheetGPUpdatedEvent = {
  scoresheetId: string;
  gpValue: number | null;
  notes?: string;
};

type ScoresheetEscalatedUpdatedEvent = {
  scoresheetId: string;
  escalated: boolean;
};

type ScoresheetSignatureUpdatedEvent = {
  scoresheetId: string;
  signature: string | null;
  status: string;
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
  const { eventData, scoresheetId } = extractEventBase(event);

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
          score
        } as ScoresheetMissionClauseUpdatedEvent)
      : null;
  }

  if ('status' in eventData && !('escalated' in eventData)) {
    const status = (eventData.status as string) || '';
    return status ? ({ scoresheetId, status } as ScoresheetStatusUpdatedEvent) : null;
  }

  if ('gpValue' in eventData || 'notes' in eventData) {
    return eventData.gpValue
      ? ({
          scoresheetId,
          gpValue: (eventData.gpValue as number | null) ?? null,
          notes: (eventData.notes as string) || undefined
        } as ScoresheetGPUpdatedEvent)
      : null;
  }

  if ('escalated' in eventData) {
    const escalated = (eventData.escalated as boolean) ?? false;
    return { scoresheetId, escalated } as ScoresheetEscalatedUpdatedEvent;
  }

  if ('signature' in eventData) {
    const signature = (eventData.signature as string) || null;
    const status = (eventData.status as string) || '';

    return status
      ? ({
          scoresheetId,
          signature,
          status
        } as ScoresheetSignatureUpdatedEvent)
      : null;
  }

  return null;
}

export const scoresheetUpdatedResolver = {
  subscribe: (_root: unknown, args: BaseSubscriptionArgs & Record<string, unknown>) => {
    const divisionId = args.divisionId as string;
    if (!divisionId) throw new Error('divisionId is required');
    return createSubscriptionIterator(divisionId, RedisEventTypes.SCORESHEET_UPDATED);
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
