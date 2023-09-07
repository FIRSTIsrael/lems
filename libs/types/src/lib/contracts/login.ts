import { ObjectId } from 'mongodb';
import { Event } from '../schemas/event';
import { JudgingRoom } from '../schemas/judging-room';
import { RobotGameTable } from '../schemas/robot-game-table';
import { Role, RoleAssociationType } from '../schemas/user';

export interface LoginPageEvent extends Event {
  rooms: JudgingRoom[];
  tables: RobotGameTable[];
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
