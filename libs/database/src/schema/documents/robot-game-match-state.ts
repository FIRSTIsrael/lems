export interface RobotGameMatchParticipantState {
  queued: boolean;
  present: boolean;
  ready: boolean;
}

export interface RobotGameMatchState {
  matchId: string; // UUID of match from robot_game_matches
  status: "not-started" | "in-progress" | "completed";
  called: boolean;
  participants: Record<string, RobotGameMatchParticipantState>; // key is participantId (UUID from robot_game_match_participants)
}
