import type { TournamentManagerData, MatchStatus, SessionStatus } from '../graphql';
import type { SlotInfo } from './types';
import { BLOCKED_STATUSES, DESTINATION_BLOCKED_STATUSES } from './constants';

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

const matchesStatus = (
  status: MatchStatus | SessionStatus | null,
  statuses: readonly string[]
): boolean => (status ? statuses.includes(status) : false);

export function isSlotBlockedForSelection(
  slot: SlotInfo,
  division: TournamentManagerData['division']
): boolean {
  return matchesStatus(getSlotStatus(slot, division), BLOCKED_STATUSES);
}

export function isSlotBlockedAsDestination(
  slot: SlotInfo,
  division: TournamentManagerData['division']
): boolean {
  return matchesStatus(getSlotStatus(slot, division), DESTINATION_BLOCKED_STATUSES);
}

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

export function isMissingTeamSlot(slot: SlotInfo): boolean {
  return !slot.matchId && !slot.sessionId;
}

export function isSlotCurrentlyLoaded(
  slot: SlotInfo,
  division: TournamentManagerData['division']
): boolean {
  return slot.type === 'match' && slot.matchId === division.field.loadedMatch;
}

export function isSourceCompleted(
  slot: SlotInfo,
  division: TournamentManagerData['division']
): boolean {
  return isSlotCompleted(slot, division);
}

export function canPerformSwap(
  source: SlotInfo,
  destination: SlotInfo,
  division: TournamentManagerData['division']
): boolean {
  const sourceStatus = getSlotStatus(source, division);
  const destStatus = getSlotStatus(destination, division);
  return sourceStatus === 'not-started' && destStatus === 'not-started';
}

export function validateSlotPair(
  source: SlotInfo | null,
  destination: SlotInfo | null,
  division: TournamentManagerData['division']
): { isValid: boolean; reasonKey?: string } {
  if (!source || !destination) {
    return { isValid: false, reasonKey: 'both-source-and-destination-required' };
  }

  if (source.type !== destination.type) {
    return { isValid: false, reasonKey: 'types-must-match' };
  }

  if (isSlotBlockedAsDestination(destination, division)) {
    return { isValid: false, reasonKey: 'cannot-move-to-blocked' };
  }

  return { isValid: true };
}
