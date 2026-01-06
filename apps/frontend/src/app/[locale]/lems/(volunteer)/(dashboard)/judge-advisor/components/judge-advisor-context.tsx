'use client';

import { createContext, useContext, useMemo, ReactNode } from 'react';
import type {
  JudgingSession,
  Award,
  CategorizedDeliberations,
  FinalDeliberation
} from '../graphql/types';

interface JudgeAdvisorContextType {
  sessions: JudgingSession[];
  disqualifiedTeams: Set<string>;
  loading: boolean;
  awards: Award[];
  deliberations: CategorizedDeliberations;
  finalDeliberation: FinalDeliberation | null;
  sessionLength: number;
}

const JudgeAdvisorContext = createContext<JudgeAdvisorContextType | null>(null);

interface JudgeAdvisorProviderProps {
  sessions: JudgingSession[];
  awards?: Award[];
  deliberations?: CategorizedDeliberations;
  finalDeliberation?: FinalDeliberation | null;
  loading?: boolean;
  sessionLength?: number;
  children?: ReactNode;
}

export function JudgeAdvisorProvider({
  sessions,
  awards = [],
  deliberations = {},
  finalDeliberation = null,
  loading = false,
  sessionLength = 0,
  children
}: JudgeAdvisorProviderProps) {
  const value = useMemo<JudgeAdvisorContextType>(() => {
    const disqualifiedTeams = new Set(
      sessions
        .map(session => session.team)
        .filter(team => team.disqualified)
        .map(team => team.id)
    );

    return {
      sessions,
      disqualifiedTeams,
      loading,
      awards,
      deliberations,
      finalDeliberation,
      sessionLength
    };
  }, [sessions, awards, deliberations, finalDeliberation, loading, sessionLength]);

  return <JudgeAdvisorContext.Provider value={value}>{children}</JudgeAdvisorContext.Provider>;
}

export function useJudgeAdvisor() {
  const context = useContext(JudgeAdvisorContext);
  if (!context) {
    throw new Error('useJudgeAdvisor must be used within a JudgeAdvisorProvider');
  }
  return context;
}
