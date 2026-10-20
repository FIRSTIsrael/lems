import dayjs, { Dayjs } from 'dayjs';
import { openDB, DBSchema } from 'idb';
import {
  AgendaBlock,
  BlocksByType,
  ScheduleBlock,
  ScheduleColumn
} from './calendar/calendar-types';

const DB_NAME = 'admin-schedule-drafts';
const DB_VERSION = 1;
const DRAFT_VERSION = 1;

export interface ScheduleDraftSettings {
  staggerMatches: boolean;
  practiceRounds: number;
  rankingRounds: number;
  practiceCycleTime: Dayjs;
  rankingCycleTime: Dayjs;
  judgingSessionCycleTime: Dayjs;
  matchLength: Dayjs;
  judgingSessionLength: Dayjs;
  fieldStart: Dayjs;
  judgingStart: Dayjs;
}

/**
 * Identifies the division setup a draft was created for.
 * A draft is discarded if any of these change, since its blocks would no longer be valid.
 */
export interface ScheduleDraftFingerprint {
  eventStartDate: string;
  teamsCount: number;
  roomsCount: number;
  tablesCount: number;
}

export interface ScheduleDraft {
  settings: ScheduleDraftSettings;
  blocks: BlocksByType;
}

type SerializedBlock = Omit<ScheduleBlock, 'startTime'> &
  Partial<Omit<AgendaBlock, 'startTime' | 'type'>> & { startTime: string };

interface StoredScheduleDraft {
  divisionId: string;
  version: number;
  savedAt: string;
  fingerprint: ScheduleDraftFingerprint;
  settings: Record<keyof ScheduleDraftSettings, string | number | boolean>;
  blocks: Record<ScheduleColumn, SerializedBlock[]>;
}

interface ScheduleDraftsDb extends DBSchema {
  drafts: {
    key: string;
    value: StoredScheduleDraft;
  };
}

const TIME_SETTINGS = [
  'practiceCycleTime',
  'rankingCycleTime',
  'judgingSessionCycleTime',
  'matchLength',
  'judgingSessionLength',
  'fieldStart',
  'judgingStart'
] as const;

const COLUMNS: ScheduleColumn[] = ['judging', 'field', 'agenda'];

const getDb = () =>
  openDB<ScheduleDraftsDb>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      db.createObjectStore('drafts', { keyPath: 'divisionId' });
    }
  });

const isSameFingerprint = (a: ScheduleDraftFingerprint, b: ScheduleDraftFingerprint) =>
  a.eventStartDate === b.eventStartDate &&
  a.teamsCount === b.teamsCount &&
  a.roomsCount === b.roomsCount &&
  a.tablesCount === b.tablesCount;

const serializeBlocks = (blocks: BlocksByType) =>
  Object.fromEntries(
    COLUMNS.map(column => [
      column,
      blocks[column].map(block => ({
        ...block,
        isDragging: undefined,
        startTime: block.startTime.toISOString()
      }))
    ])
  ) as StoredScheduleDraft['blocks'];

const deserializeBlocks = (blocks: StoredScheduleDraft['blocks']) =>
  Object.fromEntries(
    COLUMNS.map(column => [
      column,
      (blocks[column] ?? []).map(block => ({ ...block, startTime: dayjs(block.startTime) }))
    ])
  ) as BlocksByType;

export const loadScheduleDraft = async (
  divisionId: string,
  fingerprint: ScheduleDraftFingerprint
): Promise<ScheduleDraft | null> => {
  const db = await getDb();
  const stored = await db.get('drafts', divisionId);
  if (!stored) return null;

  if (stored.version !== DRAFT_VERSION || !isSameFingerprint(stored.fingerprint, fingerprint)) {
    await db.delete('drafts', divisionId);
    return null;
  }

  const settings = { ...stored.settings } as Record<string, unknown>;
  for (const key of TIME_SETTINGS) {
    settings[key] = dayjs(stored.settings[key] as string);
  }

  return {
    settings: settings as unknown as ScheduleDraftSettings,
    blocks: deserializeBlocks(stored.blocks)
  };
};

export const saveScheduleDraft = async (
  divisionId: string,
  fingerprint: ScheduleDraftFingerprint,
  draft: ScheduleDraft
) => {
  const settings = { ...draft.settings } as Record<string, unknown>;
  for (const key of TIME_SETTINGS) {
    settings[key] = draft.settings[key].toISOString();
  }

  const db = await getDb();
  await db.put('drafts', {
    divisionId,
    version: DRAFT_VERSION,
    savedAt: new Date().toISOString(),
    fingerprint,
    settings: settings as StoredScheduleDraft['settings'],
    blocks: serializeBlocks(draft.blocks)
  });
};

export const deleteScheduleDraft = async (divisionId: string) => {
  const db = await getDb();
  await db.delete('drafts', divisionId);
};
