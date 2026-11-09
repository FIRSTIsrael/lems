import dayjs from 'dayjs';
import { openDB, DBSchema } from 'idb';
import type { Edition } from '@lems/shared/edition';
import type { ScheduleContextType } from './schedule-context';
import { BlocksByType, ScheduleBlock, ScheduleColumn } from './calendar/calendar-types';

const DB_NAME = 'admin-schedule-drafts';
const DB_VERSION = 1;
const DRAFT_VERSION = 1;

export type ScheduleDraftSettings = Pick<
  ScheduleContextType,
  | 'staggerMatches'
  | 'practiceRounds'
  | 'rankingRounds'
  | 'practiceCycleTime'
  | 'rankingCycleTime'
  | 'judgingSessionCycleTime'
  | 'matchLength'
  | 'judgingSessionLength'
  | 'fieldStart'
  | 'judgingStart'
>;

/**
 * Identifies the division setup a draft was created for.
 * A draft is discarded if any of these change, since its blocks would no longer be valid.
 */
export interface ScheduleDraftFingerprint {
  eventStartDate: string;
  edition: Edition;
  teamsCount: number;
  roomsCount: number;
  tablesCount: number;
}

export interface ScheduleDraft {
  settings: ScheduleDraftSettings;
  blocks: BlocksByType;
}

interface StoredScheduleDraft {
  divisionId: string;
  version: number;
  fingerprint: ScheduleDraftFingerprint;
  settings: Record<keyof ScheduleDraftSettings, string | number | boolean>;
  blocks: Record<ScheduleColumn, (Omit<ScheduleBlock, 'startTime'> & { startTime: string })[]>;
}

interface ScheduleDraftsDb extends DBSchema {
  drafts: {
    key: string;
    value: StoredScheduleDraft;
  };
}

const getDb = () =>
  openDB<ScheduleDraftsDb>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      db.createObjectStore('drafts', { keyPath: 'divisionId' });
    }
  });

const mapValues = <T, U>(record: Record<string, T>, fn: (value: T) => U) =>
  Object.fromEntries(Object.entries(record).map(([key, value]) => [key, fn(value)]));

export const loadScheduleDraft = async (
  divisionId: string,
  fingerprint: ScheduleDraftFingerprint
): Promise<ScheduleDraft | null> => {
  const db = await getDb();
  const stored = await db.get('drafts', divisionId);
  if (!stored) return null;

  if (
    stored.version !== DRAFT_VERSION ||
    JSON.stringify(stored.fingerprint) !== JSON.stringify(fingerprint)
  ) {
    await db.delete('drafts', divisionId);
    return null;
  }

  return {
    // Time settings are the only Dayjs values, and the only ones stored as strings
    settings: mapValues(stored.settings, value =>
      typeof value === 'string' ? dayjs(value) : value
    ) as ScheduleDraftSettings,
    blocks: mapValues(stored.blocks, blocks =>
      blocks.map(block => ({ ...block, startTime: dayjs(block.startTime) }))
    ) as BlocksByType
  };
};

export const saveScheduleDraft = async (
  divisionId: string,
  fingerprint: ScheduleDraftFingerprint,
  draft: ScheduleDraft
) => {
  const db = await getDb();
  await db.put('drafts', {
    divisionId,
    version: DRAFT_VERSION,
    fingerprint,
    settings: mapValues(draft.settings, value =>
      dayjs.isDayjs(value) ? value.toISOString() : value
    ) as StoredScheduleDraft['settings'],
    blocks: mapValues(draft.blocks, blocks =>
      blocks.map(block => ({
        ...block,
        isDragging: undefined,
        startTime: block.startTime.toISOString()
      }))
    ) as StoredScheduleDraft['blocks']
  });
};

export const deleteScheduleDraft = async (divisionId: string) => {
  const db = await getDb();
  await db.delete('drafts', divisionId);
};
