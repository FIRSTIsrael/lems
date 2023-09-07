import { ObjectId, WithId } from 'mongodb';
import { Event } from '../schemas/event';
import { JudgingRoom } from '../schemas/judging-room';
import { RobotGameTable } from '../schemas/robot-game-table';
import { Role, RoleAssociationType } from '../roles';

export interface LoginPageEvent extends WithId<Event> {
  rooms: WithId<JudgingRoom>[];
  tables: WithId<RobotGameTable>[];
}

export interface LoginRequest {
  event?: ObjectId;
  username: string;
  isAdmin: boolean;
  role?: Role;
  association?: { type: RoleAssociationType; value: string | ObjectId };
  password: string;
}

export type LoginPageResponse = LoginPageEvent[];
