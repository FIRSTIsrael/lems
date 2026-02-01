'use client';

import { createContext, useContext, useMemo, useReducer, ReactNode } from 'react';
import type { TournamentManagerData } from './graphql';
import type { SlotInfo } from './components/types';

interface TournamentManagerState {
  activeTab: number;
  selectedSlot: SlotInfo | null;
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
  | SelectSecondSlotAction
  | SetCurrentRoundMatchesAction
  | SetCurrentRoundTitleAction
  | SetMissingTeamsAction
  | SetRoundSelectorAction;

export type { TournamentManagerAction };

interface TournamentManagerContextType extends TournamentManagerState {
  dispatch: React.Dispatch<TournamentManagerAction>;
}

const TournamentManagerContext = createContext<TournamentManagerContextType | undefined>(undefined);

const initialState: TournamentManagerState = {
  activeTab: 0,
  selectedSlot: null,
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

export function TournamentManagerProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(tournamentManagerReducer, initialState);

  const value = useMemo<TournamentManagerContextType>(
    () => ({
      ...state,
      dispatch
    }),
    [state]
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
