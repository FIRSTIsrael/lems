import dayjs from 'dayjs';
import { ObjectId } from 'mongodb';
import * as scheduler from 'node-schedule';
import * as db from '@lems/database';
import { JUDGING_SESSION_LENGTH } from '@lems/types';

export const handleStartSession = async (namespace, eventId, roomId, sessionId, callback) => {
  let eventState = await db.getEventState({ event: new ObjectId(eventId) });

  let session = await db.getSession({
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

  console.log(`❗ Starting session ${sessionId} for room ${roomId} in event ${eventId}`);

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
          console.log(`✅ Session ${session._id} completed`);
          db.updateSession({ _id: session._id }, { status: 'completed' });
          const updatedSession = db.getSession({ _id: new ObjectId(session._id) });
          namespace.to('judging').emit('judgingSessionCompleted', updatedSession);
        }
      });
    }.bind(null, session)
  );

  if (!eventState.currentSession || session.number > eventState.currentSession) {
    await db.updateEventState({ _id: eventState._id }, { currentSession: session.number });
  }

  callback({ ok: true });
  session = await db.getSession({ _id: new ObjectId(sessionId) });
  eventState = await db.getEventState({ event: new ObjectId(eventId) });
  namespace.to('judging').emit('judgingSessionStarted', session, eventState);
};

export const handleAbortSession = async (namespace, eventId, roomId, sessionId, callback) => {
  let session = await db.getSession({
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

  console.log(`❌ Aborting session ${sessionId} for room ${roomId} in event ${eventId}`);

  await db.updateSession({ _id: session._id }, { start: undefined, status: 'not-started' });

  callback({ ok: true });
  session = await db.getSession({ _id: new ObjectId(sessionId) });
  namespace.to('judging').emit('judgingSessionAborted', session);
};

export const handleUpdateRubric = async (
  namespace,
  eventId,
  teamId,
  rubricId,
  rubricData,
  callback
) => {
  let rubric = await db.getRubric({
    team: new ObjectId(teamId),
    _id: new ObjectId(rubricId)
  });
  if (!rubric) {
    callback({
      ok: false,
      error: `Could not find session ${rubricId} for team ${teamId} in event ${eventId}!`
    });
    return;
  }

  console.log(`🖊️ Updating rubric ${rubricId} for team ${teamId} in event ${eventId}`);

  await db.updateRubric({ _id: rubric._id }, rubricData);

  callback({ ok: true });
  rubric = await db.getRubric({ _id: new ObjectId(rubricId) });

  namespace.to('judging').emit('rubricUpdated', rubric);
  if (rubricData.status !== rubric.status)
    namespace.to('judging').emit('rubricStatusChanged', rubric);
};
