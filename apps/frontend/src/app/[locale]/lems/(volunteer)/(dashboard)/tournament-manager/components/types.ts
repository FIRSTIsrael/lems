import { Team } from '../graphql';

export enum SourceType {
  MISSING_TEAM = 'missing-team',
  REMATCH = 'rematch',
  RESCHEDULE = 'reschedule',
  DISABLED_IN_PROGRESS = 'disabled-in-progress',
  DISABLED_LOADED = 'disabled-loaded'
}

export interface SlotInfo {
  type: 'match' | 'session';
  matchId?: string;
  participantId?: string;
  sessionId?: string;
  team: Team | null;
  tableName?: string;
  roomName?: string;
  time?: string;
  sourceType?: SourceType;
}
