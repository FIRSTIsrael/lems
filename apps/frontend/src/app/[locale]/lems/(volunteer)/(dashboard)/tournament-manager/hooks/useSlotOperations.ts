'use client';

import type { Dispatch } from 'react';
import { useCallback } from 'react';
import type { TournamentManagerData } from '../graphql';
import type { SlotInfo } from '../components/types';
import { SourceType } from '../components/types';
import { classifySource, isValidDestination } from '../components/validation';
import type { TournamentManagerAction } from '../context';

export function useSlotOperations(
  division: TournamentManagerData['division'],
  dispatch: Dispatch<TournamentManagerAction>
) {
  const handleSlotClick = useCallback(
    (slot: SlotInfo, selectedSlot: SlotInfo | null, sourceType: SourceType | null) => {
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
    [division, dispatch]
  );

  const clearSelection = useCallback(() => {
    dispatch({ type: 'SELECT_SLOT', payload: null });
    dispatch({ type: 'SET_SOURCE_TYPE', payload: null });
    dispatch({ type: 'SELECT_SECOND_SLOT', payload: null });
  }, [dispatch]);

  return { handleSlotClick, clearSelection };
}
