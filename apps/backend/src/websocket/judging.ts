import dayjs from 'dayjs';
import { Socket } from 'socket.io';
import { ObjectId } from 'mongodb';
import * as scheduler from 'node-schedule';
import * as db from '@lems/database';
import {
  JudgingServerEmittedEvents,
  JudgingClientEmittedEvents,
  JudgingInterServerEvents,
  JudgingSocketData,
  JUDGING_SESSION_LENGTH
} from '@lems/types';

const judgingSocket = (
  socket: Socket<
    JudgingClientEmittedEvents,
    JudgingServerEmittedEvents,
    JudgingInterServerEvents,
    JudgingSocketData
  >
) => {
  const namespace = socket.nsp;
  console.log('WS: Judging connection');

  socket.on('startSession', async (eventId, roomId, sessionId, callback) => {
    const session = await db.getSession({
      room: new ObjectId(roomId),
      _id: new ObjectId(sessionId)
    });
    if (!session) {
      callback({ ok: false, error: `Could not find session ${sessionId} in room ${roomId}!` });
      return;
    }
    if (session.status !== 'not-started') {
      callback({ ok: false, error: `Session ${sessionId} has already started!` });
      return;
    }
    const roomSessions = await db.getRoomSessions(new ObjectId(roomId));
    if (roomSessions.find(session => session.status === 'in-progress')) {
      callback({ ok: false, error: `Room ${roomId} already has a running session!` });
      return;
    }

    console.log(`Starting session ${sessionId} for room ${roomId} in event ${eventId}`);

    session.start = new Date();
    session.status = 'in-progress';
    const { _id, ...sessionData } = session;
    await db.updateSession({ _id: session._id }, sessionData);

    const sessionEnd: Date = dayjs().add(JUDGING_SESSION_LENGTH, 'seconds').toDate();
    scheduler.scheduleJob(
      sessionEnd,
      function () {
        db.getSession({ _id: new ObjectId(session._id) }).then(newSession => {
          if (
            dayjs(newSession.start).isSame(dayjs(session.start)) &&
            newSession.status === 'in-progress'
          ) {
            console.log(`Session ${session._id} completed`);
            db.updateSession({ _id: session._id }, { status: 'completed' });
            namespace.to(eventId).emit('sessionCompleted', sessionId);
          }
        });
      }.bind(null, session)
    );

    callback({ ok: true });
    namespace.to(eventId).emit('sessionStarted', sessionId);
  });

  socket.on('abortSession', async (eventId, roomId, sessionId, callback) => {
    const session = await db.getSession({
      room: new ObjectId(roomId),
      _id: new ObjectId(sessionId)
    });
    if (!session) {
      callback({ ok: false, error: `Could not find session ${sessionId} in room ${roomId}!` });
      return;
    }
    if (session.status !== 'in-progress') {
      callback({ ok: false, error: `Session ${sessionId} is not in progress!` });
      return;
    }

    console.log(`Aborting session ${sessionId} for room ${roomId} in event ${eventId}`);

    await db.updateSession({ _id: session._id }, { start: undefined, status: 'not-started' });

    callback({ ok: true });
    namespace.to(eventId).emit('sessionAborted', sessionId);
  });

  socket.on('disconnect', () => {
    console.log('WS: Judging disconnection');
  });
};

export default judgingSocket;
