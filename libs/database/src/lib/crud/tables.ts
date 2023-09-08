import db from '../database';
import { ObjectId } from 'mongodb';
import { RobotGameTable } from '@lems/types';

export const getEventTables = (eventId: ObjectId) => {
  return db.collection<RobotGameTable>('tables').find({ event: eventId }).toArray();
};
