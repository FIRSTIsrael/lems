import type { TournamentManagerData } from './graphql';
import type { SlotInfo } from './components/types';

export function calculateMissingTeams(
  teams: TournamentManagerData['division']['teams'],
  activeTab: number,
  currentRoundMatches: TournamentManagerData['division']['field']['matches'],
  sessions: TournamentManagerData['division']['judging']['sessions']
): TournamentManagerData['division']['teams'] {
  const assignedTeamIds = new Set<string>();

  if (activeTab === 0) {
    currentRoundMatches.forEach(match => {
      match.participants.forEach(p => {
        if (p.team) assignedTeamIds.add(p.team.id);
      });
    });
  } else {
    sessions.forEach(session => {
      if (session.team) assignedTeamIds.add(session.team.id);
    });
  }

  return teams.filter(team => !assignedTeamIds.has(team.id));
}

export function createMissingTeamSlot(
  team: TournamentManagerData['division']['teams'][0],
  activeTab: number
): SlotInfo {
  return {
    type: activeTab === 0 ? 'match' : 'session',
    team,
    matchId: undefined,
    participantId: undefined,
    sessionId: undefined,
    tableName: undefined,
    roomName: undefined,
    time: undefined
  };
}

export function isSlotSelectable(slot: SlotInfo, isBlockedForSelection: boolean): boolean {
  return !isBlockedForSelection || slot.team !== null;
}

export function isValidSlotPair(
  source: SlotInfo | null,
  destination: SlotInfo,
  isDestinationBlocked: boolean
): boolean {
  if (!source) return false;
  if (isDestinationBlocked) return false;
  if (source.type !== destination.type) return false;
  if (
    (source.type === 'match' &&
      source.matchId === destination.matchId &&
      source.participantId === destination.participantId) ||
    (source.type === 'session' && source.sessionId === destination.sessionId)
  ) {
    return false;
  }
  return true;
}
