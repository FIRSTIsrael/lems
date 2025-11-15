import { Socket } from 'socket.io';
import { ObjectId } from 'mongodb';
import * as db from '@lems/database';

const divisionValidator = async (socket: Socket, next) => {
  const divisionId = socket.nsp.name.split('/')[2];

  if (!divisionId) {
    return next(new Error('NO_EVENT_ID'));
  }

  const division = db.getDivision({ _id: new ObjectId(divisionId) });
  if (!division) {
    return next(new Error('DIVISION_NOT_FOUND'));
  }

  next();
};

export default divisionValidator;
