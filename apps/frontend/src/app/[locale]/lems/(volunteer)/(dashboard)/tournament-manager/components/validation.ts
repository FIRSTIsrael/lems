import type { TournamentManagerData, MatchStatus, SessionStatus } from '../graphql';
import type { SlotInfo } from './types';
import { SourceType } from './types';

export function getSlotStatus(
  slot: SlotInfo,
  division: TournamentManagerData['division']
): MatchStatus | SessionStatus | null {
  if (slot.type === 'match' && slot.matchId) {
    return (division.field.matches.find(m => m.id === slot.matchId)?.status as MatchStatus) ?? null;
  }
  if (slot.type === 'session' && slot.sessionId) {
    return (
      (division.judging.sessions.find(s => s.id === slot.sessionId)?.status as SessionStatus) ??
      null
    );
  }
  return null;
}

export function isMissingTeamSlot(slot: SlotInfo): boolean {
  return !slot.matchId && !slot.sessionId;
}

export function classifySource(
  slot: SlotInfo,
  division: TournamentManagerData['division']
): SourceType | null {
  // Missing team slots cannot be sources
  if (isMissingTeamSlot(slot)) return SourceType.MISSING_TEAM;

  // Check if slot is currently loaded
  if (slot.type === 'match' && slot.matchId === division.field.loadedMatch) {
    return SourceType.DISABLED_LOADED;
  }

  const status = getSlotStatus(slot, division);

  if (status === 'in-progress') {
    return SourceType.DISABLED_IN_PROGRESS;
  }

  if (status === 'completed') {
    return SourceType.REMATCH;
  }

  if (status === 'not-started') {
    return SourceType.RESCHEDULE;
  }

  return null;
}

export function getValidDestinationStatuses(
  sourceType: SourceType | null
): (MatchStatus | SessionStatus)[] {
  switch (sourceType) {
    case SourceType.MISSING_TEAM:
      return ['not-started'];
    case SourceType.REMATCH:
      return ['not-started'];
    case SourceType.RESCHEDULE:
      return ['not-started'];
    default:
      return [];
  }
}

export function isValidDestination(
  slot: SlotInfo,
  sourceType: SourceType | null,
  division: TournamentManagerData['division']
): boolean {
  if (!sourceType) return false;

  // Destination cannot be loaded
  if (slot.type === 'match' && slot.matchId === division.field.loadedMatch) {
    return false;
  }

  const status = getSlotStatus(slot, division);
  const validStatuses = getValidDestinationStatuses(sourceType);

  return validStatuses.includes(status as MatchStatus | SessionStatus);
}

export type ActionType = 'move' | 'replace' | 'clear';

export function getAllowedActions(sourceType: SourceType | null): ActionType[] {
  switch (sourceType) {
    case SourceType.MISSING_TEAM:
      return ['move'];
    case SourceType.REMATCH:
      return ['move'];
    case SourceType.RESCHEDULE:
      return ['move', 'replace', 'clear'];
    default:
      return [];
  }
}

// Backward compatibility functions for useTeamOperations
export function isSlotCompleted(
  slot: SlotInfo,
  division: TournamentManagerData['division']
): boolean {
  return getSlotStatus(slot, division) === 'completed';
}

export function isSlotInProgress(
  slot: SlotInfo,
  division: TournamentManagerData['division']
): boolean {
  return getSlotStatus(slot, division) === 'in-progress';
}

export function isSlotBlockedAsDestination(
  slot: SlotInfo,
  division: TournamentManagerData['division']
): boolean {
  const sourceType = classifySource(slot, division);
  return !isValidDestination(slot, sourceType, division);
}

export function isSlotBlockedForSelection(
  slot: SlotInfo,
  division: TournamentManagerData['division']
): boolean {
  const sourceType = classifySource(slot, division);
  return (
    sourceType === SourceType.DISABLED_IN_PROGRESS ||
    sourceType === SourceType.DISABLED_LOADED ||
    sourceType === SourceType.MISSING_TEAM
  );
}

export function canSelectAsDestination(
  slot: SlotInfo,
  sourceType: SourceType | null,
  division: TournamentManagerData['division']
): boolean {
  return isValidDestination(slot, sourceType, division);
}

export function isSlotDisabled(
  slot: SlotInfo,
  selectedSlot: SlotInfo | null,
  sourceType: SourceType | null,
  secondSlot: SlotInfo | null,
  division: TournamentManagerData['division']
): boolean {
  const isCurrentSlot =
    (slot.type === 'match' && selectedSlot?.participantId === slot.participantId) ||
    (slot.type === 'session' && selectedSlot?.sessionId === slot.sessionId);

  if (isCurrentSlot) return false;

  // Disable empty slots when looking for a source
  if (!selectedSlot && !slot.team) return true;

  // Disable invalid destinations when source is selected
  if (selectedSlot && !canSelectAsDestination(slot, sourceType, division)) return true;

  // Disable blocked slots based on selection state
  if (slot.team !== null && division) {
    if (isSlotBlockedForSelection(slot, division)) return true;
    if (secondSlot && isSlotBlockedAsDestination(slot, division)) return true;
  }

  // Disable in-progress slots
  if (isSlotInProgress(slot, division)) return true;

  return false;
}
