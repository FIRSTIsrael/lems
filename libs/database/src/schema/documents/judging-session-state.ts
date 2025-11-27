export interface JudgingSessionState {
  sessionId: string; // UUID of session from judging_sessions
  status: 'not-started' | 'in-progress' | 'completed';
  called: Date | null;
  queued: Date | null;
  startTime: Date | null;
  startDelta: number | null; // ms offset from scheduled start time
}
