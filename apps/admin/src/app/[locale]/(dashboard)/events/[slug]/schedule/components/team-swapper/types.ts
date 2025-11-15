export interface RoomWithTeam {
  roomId: string;
  roomName: string;
  sessionId: string;
  teamId: string | null;
  teamNumber?: number;
  time: Date;
}
