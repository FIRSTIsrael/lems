// Re-export all validation functions from validation.ts
export {
  getSlotStatus,
  isSlotBlockedForSelection,
  isSlotBlockedAsDestination,
  isSlotCompleted,
  isSlotInProgress,
  isMissingTeamSlot,
  isSlotCurrentlyLoaded,
  isSourceCompleted,
  canPerformSwap,
  validateSlotPair
} from './validation';

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
