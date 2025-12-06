export interface RobotGameMatchParticipantState {
  queued: Date | null;
  present: Date | null;
  ready: Date | null;
}

export interface RobotGameMatchState {
  matchId: string; // UUID of match from robot_game_matches
  status: 'not-started' | 'in-progress' | 'completed';
  called: Date | null;
  startTime: Date | null;
  startDelta: number | null; // seconds offset from scheduled start time
  participants: Record<string, RobotGameMatchParticipantState>; // key is participantId (UUID from robot_game_match_participants)
}
