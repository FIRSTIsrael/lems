import { Socket } from 'socket.io';
import { ObjectId } from 'mongodb';
import * as db from '@lems/database';

const eventValidator = async (socket: Socket, next) => {
  const eventId = socket.nsp.name.split('/')[2];

  if (!eventId) {
    next(new Error('NO_EVENT_ID'));
    return;
  }

  const event = db.getEvent({ _id: new ObjectId(eventId) });
  if (event) {
    next();
    return;
  }

  next(new Error('EVENT_NOT_FOUND'));
};

export default eventValidator;
