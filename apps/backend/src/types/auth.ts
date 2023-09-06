import { ObjectId } from 'mongodb';
import { JwtPayload } from 'jsonwebtoken';

export interface JwtTokenData extends JwtPayload {
  userId: ObjectId;
}
