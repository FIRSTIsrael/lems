'use client';

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { Award, MANDATORY_AWARDS, AWARD_LIMITS } from '@lems/types/fll';
import { reorder } from '@lems/utils/arrays';
import { AwardContextValue, AwardSchema } from '../types';
import { validateAwardsSchema } from '../utils/validation';

const AwardContext = createContext<AwardContextValue | null>(null);

export function useAwards() {
  const context = useContext(AwardContext);
  if (!context) {
    throw new Error('useAwards must be used within an AwardsProvider');
  }
  return context;
}

interface AwardsProviderProps {
  children: React.ReactNode;
  divisionId: string;
  teamCount?: number;
}

export function AwardsProvider({ children, divisionId, teamCount = 32 }: AwardsProviderProps) {
  const [isLoadedFromDatabase, setIsLoadedFromDatabase] = useState(false);

  // Initialize with mandatory awards and empty schema for now
  // TODO: Load from database based on divisionId
  // When implementing database loading, call setIsLoadedFromDatabase(true) after successful load
  const [originalSchema] = useState<AwardSchema>({});
  const [currentSchema, setCurrentSchema] = useState<AwardSchema>(() => {
    const schema: AwardSchema = {};
    MANDATORY_AWARDS.forEach((award, index) => {
      schema[award] = { count: 1, index };
    });
    return schema;
  });

  const [isLoading, setIsLoading] = useState(false);

  const awards = useMemo(() => {
    const awardEntries = Object.entries(currentSchema)
      .filter(([, item]) => item.count > 0)
      .sort(([, a], [, b]) => a.index - b.index)
      .map(([award]) => award as Award);
    return awardEntries;
  }, [currentSchema]);

  /** Check if current state differs from original (Schema was loaded from database and has changes) */
  const isDirty = useMemo(() => {
    if (!isLoadedFromDatabase) return false;
    return JSON.stringify(currentSchema) !== JSON.stringify(originalSchema);
  }, [currentSchema, originalSchema, isLoadedFromDatabase]);

  const validation = useMemo(() => {
    return validateAwardsSchema(currentSchema, teamCount);
  }, [currentSchema, teamCount]);

  const updateAwardCount = useCallback((award: Award, count: number) => {
    setCurrentSchema(prev => ({
      ...prev,
      [award]: {
        ...prev[award],
        count: Math.max(0, Math.min(count, AWARD_LIMITS[award] === -1 ? 99 : AWARD_LIMITS[award]))
      }
    }));
  }, []);

  const addAward = useCallback((award: Award) => {
    setCurrentSchema(prev => {
      if (prev[award]?.count > 0) return prev; // Already exists

      const maxIndex = Math.max(...Object.values(prev).map(item => item.index), -1);
      return {
        ...prev,
        [award]: {
          count: 1,
          index: maxIndex + 1
        }
      };
    });
  }, []);

  const removeAward = useCallback((award: Award) => {
    if ((MANDATORY_AWARDS as readonly string[]).includes(award)) return;

    setCurrentSchema(prev => ({
      ...prev,
      [award]: {
        ...prev[award],
        count: 0
      }
    }));
  }, []);

  const reorderAwards = useCallback(
    (sourceIndex: number, destinationIndex: number) => {
      const reorderedAwards = reorder(awards, sourceIndex, destinationIndex);

      setCurrentSchema(prev => {
        const newSchema = { ...prev };
        reorderedAwards.forEach((award, index) => {
          if (newSchema[award]) {
            newSchema[award] = {
              ...newSchema[award],
              index
            };
          }
        });
        return newSchema;
      });
    },
    [awards]
  );

  const saveSchema = useCallback(async () => {
    setIsLoading(true);
    try {
      // TODO: Implement API call to save schema
      console.log('Saving schema for division:', divisionId, currentSchema);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // TODO: Update originalSchema with the saved data
      console.log('Schema saved successfully');
    } catch (error) {
      console.error('Failed to save schema:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [divisionId, currentSchema]);

  const resetChanges = useCallback(() => {
    setCurrentSchema(originalSchema);
  }, [originalSchema]);

  const contextValue: AwardContextValue = {
    awards,
    schema: currentSchema,
    validation,
    teamCount,
    isLoading,
    isDirty,
    isLoadedFromDatabase,
    updateAwardCount,
    addAward,
    removeAward,
    reorderAwards,
    saveSchema,
    resetChanges
  };

  return <AwardContext.Provider value={contextValue}>{children}</AwardContext.Provider>;
}
