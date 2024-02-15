import dayjs from 'dayjs';
import { ObjectId } from 'mongodb';
import * as scheduler from 'node-schedule';
import * as db from '@lems/database';
import { JUDGING_SESSION_LENGTH } from '@lems/types';

export const handleStartSession = async (namespace, eventId, roomId, sessionId, callback) => {
  let eventState = await db.getEventState({ eventId: new ObjectId(eventId) });

  let session = await db.getSession({
    roomId: new ObjectId(roomId),
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

  const startTime = new Date();
  session.startTime = startTime;
  session.status = 'in-progress';
  const { _id, ...sessionData } = session;
  await db.updateSession({ _id }, sessionData);

  const sessionEnd: Date = dayjs().add(JUDGING_SESSION_LENGTH, 'seconds').toDate();
  scheduler.scheduleJob(
    sessionEnd,
    async function () {
      const result = await db.updateSession(
        {
          _id,
          status: 'in-progress',
          startTime
        },
        {
          status: 'completed'
        }
      );

      if (result.matchedCount > 0) {
        console.log(`✅ Session ${_id} completed`);
        const updatedSession = await db.getSession({ _id });
        namespace.to('judging').emit('judgingSessionCompleted', updatedSession);
      }
    }.bind(null, startTime)
  );

  if (!eventState.currentSession || session.number > eventState.currentSession) {
    await db.updateEventState({ _id: eventState._id }, { currentSession: session.number });
  }

  callback({ ok: true });
  session = await db.getSession({ _id });
  eventState = await db.getEventState({ eventId: new ObjectId(eventId) });
  namespace.to('judging').emit('judgingSessionStarted', session, eventState);
};

export const handleAbortSession = async (namespace, eventId, roomId, sessionId, callback) => {
  let session = await db.getSession({
    roomId: new ObjectId(roomId),
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

  await db.updateSession({ _id: session._id }, { startTime: undefined, status: 'not-started' });

  callback({ ok: true });
  session = await db.getSession({ _id: new ObjectId(sessionId) });
  namespace.to('judging').emit('judgingSessionAborted', session);
};

export const handleUpdateSession = async (namespace, eventId, sessionId, data, callback) => {
  let session = await db.getSession({ _id: new ObjectId(sessionId) });
  if (data.teamId !== null) data.teamId = new ObjectId(data.teamId);

  if (!session) {
    callback({ ok: false, error: `Could not find session ${sessionId}!` });
    return;
  }
  if (session.status !== 'not-started') {
    callback({ ok: false, error: `Session ${sessionId} is not editable!` });
    return;
  }

  console.log(`🖊️ Updating team for session ${sessionId} in event ${eventId}`);

  await db.updateSession({ _id: session._id }, { ...data });

  callback({ ok: true });
  session = await db.getSession({ _id: new ObjectId(sessionId) });
  namespace.to('judging').emit('judgingSessionUpdated', session);
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
    teamId: teamId ? new ObjectId(teamId) : null,
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
  const oldRubric = rubric;
  rubric = await db.getRubric({ _id: new ObjectId(rubricId) });
  namespace.to('judging').emit('rubricUpdated', rubric);
  if (rubricData.status !== oldRubric.status)
    namespace.to('judging').emit('rubricStatusChanged', rubric);
};

export const handleCreateCvForm = async (namespace, eventId, content, callback) => {
  console.log(`📄 Creating Core Values Form in event ${eventId}`);
  const cvFormId = await db
    .addCoreValuesForm({ ...content, eventId: new ObjectId(eventId) })
    .then(result => result.insertedId);
  const cvForm = await db.getCoreValuesForm({ _id: cvFormId });

  callback({ ok: true });
  namespace.to('judging').emit('cvFormCreated', cvForm);
};

export const handleUpdateCvForm = async (namespace, eventId, cvFormId, content, callback) => {
  let cvForm = await db.getCoreValuesForm({ _id: new ObjectId(cvFormId) });
  if (!cvForm) {
    callback({
      ok: false,
      error: `Could not find core values form ${cvFormId} in event ${eventId}!`
    });
    return;
  }

  console.log(`🖊️ Updating core values form ${cvFormId} in event ${eventId}`);

  await db.updateCoreValuesForm(
    { _id: cvForm._id },
    { ...content, eventId: new ObjectId(eventId) }
  );

  callback({ ok: true });
  cvForm = await db.getCoreValuesForm({ _id: new ObjectId(cvFormId) });
  namespace.to('judging').emit('cvFormUpdated', cvForm);
};
