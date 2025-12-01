'use client';

import React, { createContext, useContext, useCallback, useMemo } from 'react';
import { useMutation } from '@apollo/client/react';
import { RubricStatus } from '@lems/database';
import {
  RubricItem,
  UPDATE_RUBRIC_VALUE_MUTATION,
  UPDATE_RUBRIC_FEEDBACK_MUTATION,
  UPDATE_RUBRIC_STATUS_MUTATION,
  UpdateRubricValueMutationResult,
  UpdateRubricValueMutationVariables,
  UpdateRubricFeedbackMutationResult,
  UpdateRubricFeedbackMutationVariables,
  UpdateRubricStatusMutationResult,
  UpdateRubricStatusMutationVariables,
  createUpdateRubricValueCacheUpdate,
  createUpdateRubricFeedbackCacheUpdate,
  createUpdateRubricStatusCacheUpdate
} from './rubric.graphql';

interface RubricContextValue {
  // Current rubric data
  rubric: RubricItem | undefined;
  divisionId: string;

  // Direct values
  /**
   * Map of all field values and their notes
   */
  fieldValues: Map<string, { value: number; notes?: string }>;

  /**
   * Feedback data
   */
  feedback: { greatJob?: string; thinkAbout?: string } | undefined;

  // Utility functions
  /**
   * Get the current value of a field
   */
  getFieldValue: (fieldId: string) => number | undefined;

  /**
   * Get the notes for a field
   */
  getFieldNotes: (fieldId: string) => string | undefined;

  /**
   * Update a field value (triggers mutation with optimistic cache update)
   */
  updateFieldValue: (fieldId: string, value: number, notes?: string) => Promise<void>;

  /**
   * Update feedback (great job and think about sections)
   */
  updateFeedback: (greatJob: string, thinkAbout: string) => Promise<void>;

  /**
   * Update rubric status (draft, empty, completed, locked, approved)
   */
  updateRubricStatus: (status: RubricStatus) => Promise<void>;
}

const RubricContext = createContext<RubricContextValue | undefined>(undefined);

interface RubricProviderProps {
  rubric: RubricItem | undefined;
  divisionId: string;
  children: React.ReactNode;
}

/**
 * Provider component for RubricContext
 * Provides access to rubric data and utility functions for updating values
 */
export const RubricProvider: React.FC<RubricProviderProps> = ({ rubric, divisionId, children }) => {
  // Setup mutations
  const [updateRubricValue] = useMutation<
    UpdateRubricValueMutationResult,
    UpdateRubricValueMutationVariables
  >(UPDATE_RUBRIC_VALUE_MUTATION, {
    errorPolicy: 'all',
    onError: (err: Error) => {
      console.error('[RubricProvider] Update value mutation error:', err);
    }
  });

  const [updateRubricFeedback] = useMutation<
    UpdateRubricFeedbackMutationResult,
    UpdateRubricFeedbackMutationVariables
  >(UPDATE_RUBRIC_FEEDBACK_MUTATION, {
    errorPolicy: 'all',
    onError: (err: Error) => {
      console.error('[RubricProvider] Update feedback mutation error:', err);
    }
  });

  const [updateRubricStatusMutation] = useMutation<
    UpdateRubricStatusMutationResult,
    UpdateRubricStatusMutationVariables
  >(UPDATE_RUBRIC_STATUS_MUTATION, {
    errorPolicy: 'all',
    onError: (err: Error) => {
      console.error('[RubricProvider] Update status mutation error:', err);
    }
  });

  /**
   * Compute field values map from rubric data
   */
  const fieldValues = useMemo(() => {
    const values = new Map<string, { value: number; notes?: string }>();

    if (rubric?.data?.values) {
      Object.entries(rubric.data.values).forEach(([fieldId, fieldData]) => {
        const data = fieldData as Record<string, unknown>;
        values.set(fieldId, {
          value: (data.value as number) || 0,
          notes: (data.notes as string) || undefined
        });
      });
    }

    return values;
  }, [rubric?.data?.values]);

  /**
   * Get feedback data from rubric
   */
  const feedback = useMemo(() => rubric?.data?.feedback, [rubric?.data?.feedback]);

  /**
   * Get the current value of a specific field
   */
  const getFieldValue = useCallback(
    (fieldId: string): number | undefined => {
      return fieldValues.get(fieldId)?.value;
    },
    [fieldValues]
  );

  /**
   * Get the notes for a specific field
   */
  const getFieldNotes = useCallback(
    (fieldId: string): string | undefined => {
      return fieldValues.get(fieldId)?.notes;
    },
    [fieldValues]
  );

  /**
   * Update a field value with optimistic cache update
   */
  const updateFieldValue = useCallback(
    async (fieldId: string, value: number, notes?: string) => {
      if (!rubric) {
        console.warn('[RubricProvider] Cannot update field without rubric');
        return;
      }

      const fieldValue = { value, notes: notes || undefined };

      try {
        await updateRubricValue({
          variables: {
            divisionId,
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
    [rubric, divisionId, updateRubricValue]
  );

  /**
   * Update feedback with optimistic cache update
   */
  const updateFeedback = useCallback(
    async (greatJob: string, thinkAbout: string) => {
      if (!rubric) {
        console.warn('[RubricProvider] Cannot update feedback without rubric');
        return;
      }

      try {
        await updateRubricFeedback({
          variables: {
            divisionId,
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
    [rubric, divisionId, updateRubricFeedback]
  );

  /**
   * Update rubric status with optimistic cache update
   */
  const updateRubricStatus = useCallback(
    async (status: RubricStatus) => {
      if (!rubric) {
        console.warn('[RubricProvider] Cannot update status without rubric');
        return;
      }

      try {
        await updateRubricStatusMutation({
          variables: {
            divisionId,
            rubricId: rubric.id,
            status
          },
          update: createUpdateRubricStatusCacheUpdate(rubric.id, status)
        });
      } catch (err) {
        console.error('[RubricProvider] Failed to update status:', err);
        throw err;
      }
    },
    [rubric, divisionId, updateRubricStatusMutation]
  );

  const value: RubricContextValue = useMemo(
    () => ({
      rubric,
      divisionId,
      fieldValues,
      feedback,
      getFieldValue,
      getFieldNotes,
      updateFieldValue,
      updateFeedback,
      updateRubricStatus
    }),
    [
      rubric,
      divisionId,
      fieldValues,
      feedback,
      getFieldValue,
      getFieldNotes,
      updateFieldValue,
      updateFeedback,
      updateRubricStatus
    ]
  );

  return <RubricContext.Provider value={value}>{children}</RubricContext.Provider>;
};

/**
 * Hook to access the RubricContext
 * Must be used within a RubricProvider
 */
export function useRubric(): RubricContextValue {
  const context = useContext(RubricContext);
  if (!context) {
    throw new Error('useRubric must be used within a RubricProvider');
  }
  return context;
}
