'use client';

import { useCallback, useMemo } from 'react';
import type { Dispatch } from 'react';
import type { TournamentManagerData } from '../graphql';
import type { TournamentManagerAction } from '../context';
import { useTournamentManager } from '../context';
import { createMissingTeamSlot } from '../components/schedule/utils';
import type { SlotInfo } from '../components/types';
import { SourceType } from '../components/types';
import { classifySource, isValidDestination } from '../components/validation';
import { useTeamOperations } from './useTeamOperations';

const clearSelection = (dispatch: Dispatch<TournamentManagerAction>): void => {
  dispatch({ type: 'SELECT_SLOT', payload: null });
  dispatch({ type: 'SET_SOURCE_TYPE', payload: null });
  dispatch({ type: 'SELECT_SECOND_SLOT', payload: null });
};

interface UseScheduleOperationsReturn {
  handleRoundChange: (
    matches: TournamentManagerData['division']['field']['matches'],
    title: string
  ) => void;
  handleSlotClick: (slot: SlotInfo) => void;
  handleMoveClick: () => Promise<void>;
  handleReplaceClick: () => Promise<void>;
  handleClearClick: () => Promise<void>;
  handleDrawerClose: () => void;
  handleTabChange: (_: React.SyntheticEvent, newValue: number) => void;
  handleRoundSelector: (selector: React.ReactNode) => void;
  handleTeamClick: (team: TournamentManagerData['division']['teams'][0]) => void;
  selectedSlot: SlotInfo | null;
  sourceType: SourceType | null;
  secondSlot: SlotInfo | null;
  activeTab: number;
  error: string | null;
  setError: (error: string | null) => void;
}

export function useScheduleOperations(
  division: TournamentManagerData['division']
): UseScheduleOperationsReturn {
  const { activeTab, selectedSlot, sourceType, secondSlot, dispatch } = useTournamentManager();
  const { handleMove, handleReplace, clearTeam, error, setError } = useTeamOperations(
    division.id,
    division
  );

  const handleRoundChange = useCallback(
    (matches: TournamentManagerData['division']['field']['matches'], title: string) => {
      clearSelection(dispatch);
      dispatch({ type: 'SET_CURRENT_ROUND_MATCHES', payload: matches });
      dispatch({ type: 'SET_CURRENT_ROUND_TITLE', payload: title });
    },
    [dispatch]
  );

  const handleSlotClick = useCallback(
    (slot: SlotInfo) => {
      if (!selectedSlot) {
        const newSourceType = classifySource(slot, division);
        if (newSourceType && slot.team) {
          dispatch({ type: 'SELECT_SLOT', payload: slot });
          dispatch({ type: 'SET_SOURCE_TYPE', payload: newSourceType });
        }
      } else if (
        (slot.type === 'match' && selectedSlot.participantId !== slot.participantId) ||
        (slot.type === 'session' && selectedSlot.sessionId !== slot.sessionId)
      ) {
        if (isValidDestination(slot, sourceType, division)) {
          dispatch({ type: 'SELECT_SECOND_SLOT', payload: slot });
        }
      }
    },
    [selectedSlot, sourceType, dispatch, division]
  );

  const handleOperationWrapper = useCallback(
    async (operation: () => Promise<void>) => {
      try {
        await operation();
        clearSelection(dispatch);
      } catch {
        // Error already set by hook
      }
    },
    [dispatch]
  );

  const handleMoveClick = useCallback(
    () => handleOperationWrapper(() => handleMove(selectedSlot, secondSlot)),
    [handleOperationWrapper, handleMove, selectedSlot, secondSlot]
  );

  const handleReplaceClick = useCallback(
    () => handleOperationWrapper(() => handleReplace(selectedSlot, secondSlot)),
    [handleOperationWrapper, handleReplace, selectedSlot, secondSlot]
  );

  const handleClearClick = useCallback(
    () => handleOperationWrapper(() => clearTeam(selectedSlot)),
    [handleOperationWrapper, clearTeam, selectedSlot]
  );

  const handleDrawerClose = useCallback(() => {
    clearSelection(dispatch);
  }, [dispatch]);

  const handleTabChange = useCallback(
    (_: React.SyntheticEvent, newValue: number) => {
      dispatch({ type: 'SET_ACTIVE_TAB', payload: newValue });
    },
    [dispatch]
  );

  const handleRoundSelector = useCallback(
    (selector: React.ReactNode) => {
      dispatch({ type: 'SET_ROUND_SELECTOR', payload: selector });
    },
    [dispatch]
  );

  const handleTeamClick = useCallback(
    (team: TournamentManagerData['division']['teams'][0]) => {
      const slot = createMissingTeamSlot(team, activeTab);
      dispatch({ type: 'SELECT_SLOT', payload: slot });
      dispatch({ type: 'SET_SOURCE_TYPE', payload: SourceType.MISSING_TEAM });
      dispatch({ type: 'SELECT_SECOND_SLOT', payload: null });
    },
    [activeTab, dispatch]
  );

  return useMemo(
    () => ({
      handleRoundChange,
      handleSlotClick,
      handleMoveClick,
      handleReplaceClick,
      handleClearClick,
      handleDrawerClose,
      handleTabChange,
      handleRoundSelector,
      handleTeamClick,
      selectedSlot,
      sourceType,
      secondSlot,
      activeTab,
      error,
      setError
    }),
    [
      handleRoundChange,
      handleSlotClick,
      handleMoveClick,
      handleReplaceClick,
      handleClearClick,
      handleDrawerClose,
      handleTabChange,
      handleRoundSelector,
      handleTeamClick,
      selectedSlot,
      sourceType,
      secondSlot,
      activeTab,
      error,
      setError
    ]
  );
}
