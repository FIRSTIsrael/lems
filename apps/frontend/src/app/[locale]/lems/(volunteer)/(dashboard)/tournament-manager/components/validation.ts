import type { TournamentManagerData, MatchStatus, SessionStatus } from '../graphql';
import type { SlotInfo } from './types';
import { BLOCKED_STATUSES, DESTINATION_BLOCKED_STATUSES } from './constants';

export function getSlotStatus(
  slot: SlotInfo,
  division: TournamentManagerData['division']
): MatchStatus | SessionStatus | null {
  if (slot.type === 'match' && slot.matchId) {
    const match = division.field.matches.find(m => m.id === slot.matchId);
    return (match?.status as MatchStatus) ?? null;
  } else if (slot.type === 'session' && slot.sessionId) {
    const session = division.judging.sessions.find(s => s.id === slot.sessionId);
    return (session?.status as SessionStatus) ?? null;
  }
  return null;
}

export function isSlotBlockedForSelection(
  slot: SlotInfo,
  division: TournamentManagerData['division']
): boolean {
  const status = getSlotStatus(slot, division);
  return status ? BLOCKED_STATUSES.includes(status as (typeof BLOCKED_STATUSES)[number]) : false;
}

export function isSlotBlockedAsDestination(
  slot: SlotInfo,
  division: TournamentManagerData['division']
): boolean {
  const status = getSlotStatus(slot, division);
  return status
    ? DESTINATION_BLOCKED_STATUSES.includes(status as (typeof DESTINATION_BLOCKED_STATUSES)[number])
    : false;
}

export function isSlotCompleted(
  slot: SlotInfo,
  division: TournamentManagerData['division']
): boolean {
  const status = getSlotStatus(slot, division);
  return status === 'completed';
}

export function isSlotInProgress(
  slot: SlotInfo,
  division: TournamentManagerData['division']
): boolean {
  const status = getSlotStatus(slot, division);
  return status === 'in-progress';
}

export function isMissingTeamSlot(slot: SlotInfo): boolean {
  return !slot.matchId && !slot.sessionId;
}

export function isSlotCurrentlyLoaded(
  slot: SlotInfo,
  division: TournamentManagerData['division']
): boolean {
  if (slot.type === 'match' && slot.matchId) {
    return division.field.loadedMatch === slot.matchId;
  }
  return false;
}

export function isSourceCompleted(
  slot: SlotInfo,
  division: TournamentManagerData['division']
): boolean {
  const status = getSlotStatus(slot, division);
  return status === 'completed';
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
