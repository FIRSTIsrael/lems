'use client';

import { createContext, useContext, useMemo, ReactNode } from 'react';
import type {
  JudgingSession,
  Award,
  JudgingDeliberation,
  FinalDeliberation
} from '../graphql/types';

interface JudgeAdvisorContextType {
  sessions: JudgingSession[];
  disqualifiedTeams: Set<string>;
  loading: boolean;
  awards: Award[];
  deliberations: JudgingDeliberation[];
  finalDeliberation: FinalDeliberation | null;
}

const JudgeAdvisorContext = createContext<JudgeAdvisorContextType | null>(null);

interface JudgeAdvisorProviderProps {
  sessions: JudgingSession[];
  awards?: Award[];
  deliberations?: JudgingDeliberation[];
  finalDeliberation?: FinalDeliberation | null;
  loading?: boolean;
  children?: ReactNode;
}

export function JudgeAdvisorProvider({
  sessions,
  awards = [],
  deliberations = [],
  finalDeliberation = null,
  loading = false,
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
      finalDeliberation
    };
  }, [sessions, awards, deliberations, finalDeliberation, loading]);

  return <JudgeAdvisorContext.Provider value={value}>{children}</JudgeAdvisorContext.Provider>;
}

export function useJudgeAdvisor() {
  const context = useContext(JudgeAdvisorContext);
  if (!context) {
    throw new Error('useJudgeAdvisor must be used within a JudgeAdvisorProvider');
  }
  return context;
}
