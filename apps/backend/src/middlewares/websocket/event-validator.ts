import { Socket } from 'socket.io';
import { ObjectId } from 'mongodb';
import * as db from '@lems/database';

const eventValidator = async (socket: Socket, next) => {
  const eventId = socket.nsp.name.split('/')[2];

  if (!eventId) {
    return next(new Error('NO_EVENT_ID'));
  }

  const event = db.getEvent({ _id: new ObjectId(eventId) });
  if (!event) {
    return next(new Error('EVENT_NOT_FOUND'));
  }

  next();
};

export default eventValidator;
