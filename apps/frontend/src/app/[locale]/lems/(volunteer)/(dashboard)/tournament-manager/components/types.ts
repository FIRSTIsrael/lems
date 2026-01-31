export interface SlotInfo {
  type: 'match' | 'session';
  matchId?: string;
  participantId?: string;
  sessionId?: string;
  team: { id: string; number: number; name: string } | null;
  tableName?: string;
  roomName?: string;
  time?: string;
}
