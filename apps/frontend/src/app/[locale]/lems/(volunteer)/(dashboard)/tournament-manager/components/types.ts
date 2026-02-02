import { Team } from '../graphql';

export interface SlotInfo {
  type: 'match' | 'session';
  matchId?: string;
  participantId?: string;
  sessionId?: string;
  team: Team | null;
  tableName?: string;
  roomName?: string;
  time?: string;
}
