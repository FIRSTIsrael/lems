'use client';

import { createContext, useContext, useMemo, useReducer, ReactNode, useState } from 'react';
import type { TournamentManagerData } from './graphql';
import type { SlotInfo } from './components/types';
import { SourceType } from './components/types';
import { useTeamOperations } from './hooks/useTeamOperations';

interface TournamentManagerState {
  activeTab: number;
  selectedSlot: SlotInfo | null;
  sourceType: SourceType | null;
  secondSlot: SlotInfo | null;
  currentRoundMatches: TournamentManagerData['division']['field']['matches'];
  currentRoundTitle: string;
  missingTeams: TournamentManagerData['division']['teams'];
  roundSelector: React.ReactNode;
}

interface SetActiveTabAction {
  type: 'SET_ACTIVE_TAB';
  payload: number;
}

interface SelectSlotAction {
  type: 'SELECT_SLOT';
  payload: SlotInfo | null;
}

interface SetSourceTypeAction {
  type: 'SET_SOURCE_TYPE';
  payload: SourceType | null;
}

interface SelectSecondSlotAction {
  type: 'SELECT_SECOND_SLOT';
  payload: SlotInfo | null;
}

interface SetCurrentRoundMatchesAction {
  type: 'SET_CURRENT_ROUND_MATCHES';
  payload: TournamentManagerData['division']['field']['matches'];
}

interface SetCurrentRoundTitleAction {
  type: 'SET_CURRENT_ROUND_TITLE';
  payload: string;
}

interface SetMissingTeamsAction {
  type: 'SET_MISSING_TEAMS';
  payload: TournamentManagerData['division']['teams'];
}

interface SetRoundSelectorAction {
  type: 'SET_ROUND_SELECTOR';
  payload: React.ReactNode;
}

type TournamentManagerAction =
  | SetActiveTabAction
  | SelectSlotAction
  | SetSourceTypeAction
  | SelectSecondSlotAction
  | SetCurrentRoundMatchesAction
  | SetCurrentRoundTitleAction
  | SetMissingTeamsAction
  | SetRoundSelectorAction;

export type { TournamentManagerAction };

interface TournamentManagerOperations {
  handleMove: (selectedSlot: SlotInfo | null, secondSlot: SlotInfo | null) => Promise<void>;
  handleReplace: (selectedSlot: SlotInfo | null, secondSlot: SlotInfo | null) => Promise<void>;
  assignTeamToSlot: (teamId: string, slot: SlotInfo) => Promise<void>;
  clearTeam: (selectedSlot: SlotInfo | null) => Promise<void>;
}

interface TournamentManagerContextType extends TournamentManagerState {
  division: TournamentManagerData['division'];
  dispatch: React.Dispatch<TournamentManagerAction>;
  operations: TournamentManagerOperations;
  error: string | null;
  setError: (error: string | null) => void;
}

const TournamentManagerContext = createContext<TournamentManagerContextType | undefined>(undefined);

const initialState: TournamentManagerState = {
  activeTab: 0,
  selectedSlot: null,
  sourceType: null,
  secondSlot: null,
  currentRoundMatches: [],
  currentRoundTitle: '',
  missingTeams: [],
  roundSelector: null
};

function tournamentManagerReducer(
  state: TournamentManagerState,
  action: TournamentManagerAction
): TournamentManagerState {
  switch (action.type) {
    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.payload };
    case 'SELECT_SLOT':
      return { ...state, selectedSlot: action.payload };
    case 'SET_SOURCE_TYPE':
      return { ...state, sourceType: action.payload };
    case 'SELECT_SECOND_SLOT':
      return { ...state, secondSlot: action.payload };
    case 'SET_CURRENT_ROUND_MATCHES':
      return { ...state, currentRoundMatches: action.payload };
    case 'SET_CURRENT_ROUND_TITLE':
      return { ...state, currentRoundTitle: action.payload };
    case 'SET_MISSING_TEAMS':
      return { ...state, missingTeams: action.payload };
    case 'SET_ROUND_SELECTOR':
      return { ...state, roundSelector: action.payload };
    default:
      return state;
  }
}

interface TournamentManagerProviderProps {
  children: ReactNode;
  division: TournamentManagerData['division'];
}

export function TournamentManagerProvider({ children, division }: TournamentManagerProviderProps) {
  const [state, dispatch] = useReducer(tournamentManagerReducer, initialState);
  const [error, setError] = useState<string | null>(null);
  const { handleMove, handleReplace, assignTeamToSlot, clearTeam } = useTeamOperations(
    division.id,
    division
  );

  const operations: TournamentManagerOperations = useMemo(
    () => ({
      handleMove,
      handleReplace,
      assignTeamToSlot,
      clearTeam
    }),
    [handleMove, handleReplace, assignTeamToSlot, clearTeam]
  );

  const value = useMemo<TournamentManagerContextType>(
    () => ({
      ...state,
      division,
      dispatch,
      operations,
      error,
      setError
    }),
    [state, division, operations, error]
  );

  return (
    <TournamentManagerContext.Provider value={value}>{children}</TournamentManagerContext.Provider>
  );
}

export function useTournamentManager() {
  const context = useContext(TournamentManagerContext);
  if (!context) {
    throw new Error('useTournamentManager must be used within TournamentManagerProvider');
  }
  return context;
}
