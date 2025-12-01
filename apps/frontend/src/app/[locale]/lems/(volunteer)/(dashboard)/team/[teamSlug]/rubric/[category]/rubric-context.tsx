'use client';

import React, { createContext, useContext, useCallback, useMemo } from 'react';
import { useMutation } from '@apollo/client/react';
import { useEvent } from '../../../../../components/event-context';
import {
  UPDATE_RUBRIC_VALUE_MUTATION,
  UPDATE_RUBRIC_FEEDBACK_MUTATION,
  createUpdateRubricValueCacheUpdate,
  createUpdateRubricFeedbackCacheUpdate
} from './rubric.graphql';
import { RubricItem } from './types';

interface RubricContextValue {
  rubric: RubricItem;
  updateFieldValue: (fieldId: string, value: 1 | 2 | 3 | 4, notes?: string) => Promise<void>;
  updateFeedback: (greatJob: string, thinkAbout: string) => Promise<void>;
}

const RubricContext = createContext<RubricContextValue | undefined>(undefined);

interface RubricProviderProps {
  rubric: RubricItem;
  children: React.ReactNode;
}

export const RubricProvider: React.FC<RubricProviderProps> = ({ rubric, children }) => {
  const { currentDivision } = useEvent();

  const [updateRubricValue] = useMutation(UPDATE_RUBRIC_VALUE_MUTATION, {
    errorPolicy: 'all',
    onError: (err: Error) => {
      console.error('[RubricProvider] Update value mutation error:', err);
    }
  });

  const [updateRubricFeedback] = useMutation(UPDATE_RUBRIC_FEEDBACK_MUTATION, {
    errorPolicy: 'all',
    onError: (err: Error) => {
      console.error('[RubricProvider] Update feedback mutation error:', err);
    }
  });

  const updateFieldValue = useCallback(
    async (fieldId: string, value: 1 | 2 | 3 | 4, notes?: string) => {
      const fieldValue = { value, notes: notes || undefined };

      try {
        await updateRubricValue({
          variables: {
            divisionId: currentDivision.id,
            rubricId: rubric.id,
            fieldId,
            value,
            notes: notes || undefined
          },
          update: createUpdateRubricValueCacheUpdate(rubric.id, fieldId, fieldValue)
        });
      } catch (err) {
        console.error(`[RubricProvider] Failed to update field ${fieldId}:`, err);
        throw err;
      }
    },
    [updateRubricValue, currentDivision.id, rubric.id]
  );

  const updateFeedback = useCallback(
    async (greatJob: string, thinkAbout: string) => {
      try {
        await updateRubricFeedback({
          variables: {
            divisionId: currentDivision.id,
            rubricId: rubric.id,
            greatJob,
            thinkAbout
          },
          update: createUpdateRubricFeedbackCacheUpdate(rubric.id, {
            greatJob,
            thinkAbout
          })
        });
      } catch (err) {
        console.error('[RubricProvider] Failed to update feedback:', err);
        throw err;
      }
    },
    [updateRubricFeedback, currentDivision.id, rubric.id]
  );

  const value: RubricContextValue = useMemo(
    () => ({
      rubric,
      updateFieldValue,
      updateFeedback
    }),
    [rubric, updateFieldValue, updateFeedback]
  );

  return <RubricContext.Provider value={value}>{children}</RubricContext.Provider>;
};

export function useRubric(): RubricContextValue {
  const context = useContext(RubricContext);
  if (!context) {
    throw new Error('useRubric must be used within a RubricProvider');
  }
  return context;
}
