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
 * A draft is only restored if all of these match, since its blocks would no longer be valid otherwise.
 * A mismatched draft is kept (not restored) until the next save overwrites it.
 */
export interface ScheduleDraftFingerprint {
  eventStartDate: string;
  edition: Edition;
  teamsCount: number;
  roomsCount: number;
  tablesCount: number;
  pairsCount: number;
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

// A single shared connection, so saves don't open (and leak) a connection each time
let dbPromise: ReturnType<typeof openDb> | null = null;

const openDb = () =>
  openDB<ScheduleDraftsDb>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      db.createObjectStore('drafts', { keyPath: 'divisionId' });
    },
    terminated() {
      dbPromise = null;
    }
  });

const getDb = () => {
  dbPromise ??= openDb().catch(error => {
    dbPromise = null;
    throw error;
  });
  return dbPromise;
};

const SETTING_KEYS: Record<keyof ScheduleDraftSettings, 'boolean' | 'number' | 'time'> = {
  staggerMatches: 'boolean',
  practiceRounds: 'number',
  rankingRounds: 'number',
  practiceCycleTime: 'time',
  rankingCycleTime: 'time',
  judgingSessionCycleTime: 'time',
  matchLength: 'time',
  judgingSessionLength: 'time',
  fieldStart: 'time',
  judgingStart: 'time'
};

const BLOCK_COLUMNS: ScheduleColumn[] = ['field', 'judging', 'agenda'];

/** Rebuilds a draft from stored data, returning null if it is malformed */
const parseStoredDraft = (stored: StoredScheduleDraft): ScheduleDraft | null => {
  const settings: Record<string, unknown> = {};
  for (const [key, kind] of Object.entries(SETTING_KEYS)) {
    const value: unknown = stored.settings?.[key as keyof ScheduleDraftSettings];
    if (kind === 'time') {
      if (typeof value !== 'string') return null;
      const parsed = dayjs(value);
      if (!parsed.isValid()) return null;
      settings[key] = parsed;
    } else {
      if (typeof value !== kind) return null;
      settings[key] = value;
    }
  }

  const blocks: Record<string, ScheduleBlock[]> = {};
  for (const column of BLOCK_COLUMNS) {
    const storedBlocks = stored.blocks?.[column];
    if (!Array.isArray(storedBlocks)) return null;
    const parsedBlocks: ScheduleBlock[] = [];
    for (const block of storedBlocks) {
      if (!block || typeof block.startTime !== 'string') return null;
      const startTime = dayjs(block.startTime);
      if (!startTime.isValid()) return null;
      parsedBlocks.push({ ...block, startTime } as ScheduleBlock);
    }
    blocks[column] = parsedBlocks;
  }
  // The calendar reads the first block of these columns
  if (blocks.field.length === 0 || blocks.judging.length === 0) return null;

  return {
    settings: settings as unknown as ScheduleDraftSettings,
    blocks: blocks as unknown as BlocksByType
  };
};

const mapValues = <T, U>(record: Record<string, T>, fn: (value: T) => U) =>
  Object.fromEntries(Object.entries(record).map(([key, value]) => [key, fn(value)]));

export const loadScheduleDraft = async (
  divisionId: string,
  fingerprint: ScheduleDraftFingerprint
): Promise<ScheduleDraft | null> => {
  const db = await getDb();
  const stored = await db.get('drafts', divisionId);
  if (!stored) return null;

  // A fingerprint mismatch only means the draft doesn't apply right now (the setup may be changing
  // transiently), so the draft is kept and simply overwritten by the next save.
  if (JSON.stringify(stored.fingerprint) !== JSON.stringify(fingerprint)) return null;

  const draft = stored.version === DRAFT_VERSION ? parseStoredDraft(stored) : null;
  if (!draft) {
    // Outdated or corrupted, it can never be restored
    await db.delete('drafts', divisionId);
    return null;
  }
  return draft;
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
