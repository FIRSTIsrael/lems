'use client';

import React, { createContext, useContext, useMemo, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUser } from '../../../../../../components/user-context';
import type { ScoresheetItem } from './graphql';
import { validateScoresheet, type ScoresheetValidationResult } from './scoresheet-validation';

export type ScoresheetView = 'score' | 'gp';

interface ScoresheetContextValue {
  scoresheet: ScoresheetItem;
  validation: ScoresheetValidationResult;
  forceEdit: boolean;
  viewMode: ScoresheetView;
  setViewMode: (mode: ScoresheetView) => void;
}

const ScoresheetContext = createContext<ScoresheetContextValue | undefined>(undefined);

interface ScoresheetProviderProps {
  scoresheet: ScoresheetItem;
  forceEdit?: boolean;
  children: React.ReactNode;
}

export const ScoresheetProvider: React.FC<ScoresheetProviderProps> = ({
  scoresheet,
  forceEdit = false,
  children
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useUser();

  const validation = useMemo(() => {
    return validateScoresheet(scoresheet.data);
  }, [scoresheet.data]);

  // Compute desired view mode based on status and URL override
  const viewMode: ScoresheetView = useMemo(() => {
    const override = searchParams.get('view');

    if (user.role === 'head-referee' && (override === 'gp' || override === 'score')) {
      return override;
    }

    return scoresheet.status === 'gp' ? 'gp' : 'score';
  }, [scoresheet, searchParams, user.role]);

  const setViewMode = useCallback(
    (newView: ScoresheetView) => {
      const params = new URLSearchParams(searchParams);
      params.set('view', newView);
      router.push(`?${params.toString()}`, { scroll: false });
    },
    [searchParams, router]
  );

  return (
    <ScoresheetContext.Provider
      value={{
        scoresheet,
        validation,
        forceEdit,
        viewMode,
        setViewMode
      }}
    >
      {children}
    </ScoresheetContext.Provider>
  );
};

export function useScoresheet(): ScoresheetContextValue {
  const context = useContext(ScoresheetContext);
  if (!context) {
    throw new Error('useScoresheet must be used within a ScoresheetProvider');
  }
  return context;
}
