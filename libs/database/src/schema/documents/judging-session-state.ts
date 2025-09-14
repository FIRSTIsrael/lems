export interface JudgingSessionState {
  sessionId: string; // UUID of session from judging_sessions
  status: 'not-started' | 'in-progress' | 'completed';
  called: boolean;
  queued: boolean;
  startTime: Date | null;
  startDelta: number | null; // ms offset from scheduled start time
}