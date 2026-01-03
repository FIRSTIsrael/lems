'use client';

import { createContext, useContext, useMemo, ReactNode } from 'react';
import type { JudgingSession, Team } from '../graphql/types';

interface JudgeAdvisorContextType {
  sessions: JudgingSession[];
  disqualifiedTeams: Team[];
}

const JudgeAdvisorContext = createContext<JudgeAdvisorContextType | null>(null);

interface JudgeAdvisorProviderProps {
  sessions: JudgingSession[];
  children?: ReactNode;
}

export function JudgeAdvisorProvider({ sessions, children }: JudgeAdvisorProviderProps) {
  const value = useMemo<JudgeAdvisorContextType>(() => {
    const disqualifiedTeams = new Set(
      sessions
        .map(session => session.team)
        .filter(team => team.disqualified)
        .map(team => team.id)
    );

    return {
      sessions,
      disqualifiedTeams
    };
  }, [sessions]);

  return <JudgeAdvisorContext.Provider value={value}>{children}</JudgeAdvisorContext.Provider>;
}

export function useJudgeAdvisor() {
  const context = useContext(JudgeAdvisorContext);
  if (!context) {
    throw new Error('useJudgeAdvisor must be used within a JudgeAdvisorProvider');
  }
  return context;
}
