'use client';

import { createContext, useContext, useMemo, ReactNode } from 'react';
import { JudgingCategory } from '@lems/database';
import { underscoresToHyphens } from '@lems/shared/utils';
import type { JudgingSession, Deliberation } from '../graphql';

interface LeadJudgeContextType {
  sessions: JudgingSession[];
  category: JudgingCategory;
  deliberation: Deliberation | null;
  desiredPicklistLength: number;
  sessionLength: number;
  loading: boolean;
}

const LeadJudgeContext = createContext<LeadJudgeContextType | null>(null);

interface LeadJudgeProviderProps {
  sessions: JudgingSession[];
  category: string;
  deliberation: Deliberation | null;
  desiredPicklistLength: number;
  sessionLength?: number;
  loading?: boolean;
  children?: ReactNode;
}

export function LeadJudgeProvider({
  sessions,
  category,
  deliberation,
  desiredPicklistLength,
  sessionLength = 0,
  loading = false,
  children
}: LeadJudgeProviderProps) {
  const value = useMemo<LeadJudgeContextType>(
    () => ({
      sessions,
      category: underscoresToHyphens(category) as JudgingCategory,
      deliberation,
      desiredPicklistLength,
      sessionLength,
      loading
    }),
    [sessions, category, deliberation, desiredPicklistLength, sessionLength, loading]
  );

  return <LeadJudgeContext.Provider value={value}>{children}</LeadJudgeContext.Provider>;
}

export function useLeadJudge() {
  const context = useContext(LeadJudgeContext);
  if (!context) {
    throw new Error('useLeadJudge must be used within LeadJudgeProvider');
  }
  return context;
}
