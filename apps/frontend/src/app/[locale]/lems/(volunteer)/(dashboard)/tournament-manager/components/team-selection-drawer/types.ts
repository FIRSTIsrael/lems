import type { TournamentManagerData } from '../../graphql';
import type { SlotInfo } from '../types';

export interface BaseSlotSectionProps {
  slot: SlotInfo | null;
  division: TournamentManagerData['division'];
  isMobile: boolean;
  getStage?: (stage: string) => string;
}

export interface MatchesListProps extends BaseSlotSectionProps {
  matches: TournamentManagerData['division']['field']['matches'];
}

export interface SessionsListProps extends BaseSlotSectionProps {
  sessions: TournamentManagerData['division']['judging']['sessions'];
}
