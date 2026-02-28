'use client';

import { createContext, useContext } from 'react';
import { JudgingSession } from '../../graphql';

interface JudgingSessionContextType {
  session: JudgingSession;
  sessionLength: number;
  openRubricsDuringSession?: boolean;
}

const JudgingSessionContext = createContext<JudgingSessionContextType | null>(null);

export function JudgingSessionProvider({
  children,
  session,
  sessionLength,
  openRubricsDuringSession = false
}: {
  children: React.ReactNode;
  session: JudgingSession;
  sessionLength: number;
  openRubricsDuringSession?: boolean;
}) {
  return (
    <JudgingSessionContext.Provider
      value={{ session, sessionLength, openRubricsDuringSession }}
    >
      {children}
    </JudgingSessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(JudgingSessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  if (!context.session.startTime) {
    throw new Error('useSession must be used on a started judging session.');
  }
  return context;
}
