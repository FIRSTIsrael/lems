export interface RobotGameMatchParticipantState {
  queued: Date | null;
  present: Date | null;
  ready: Date | null;
}

export interface RobotGameMatchState {
  matchId: string; // UUID of match from robot_game_matches
  status: 'not-started' | 'in-progress' | 'completed';
  called: Date | null;
  participants: Record<string, RobotGameMatchParticipantState>; // key is participantId (UUID from robot_game_match_participants)
}
