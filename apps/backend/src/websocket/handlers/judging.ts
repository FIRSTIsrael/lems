import dayjs from 'dayjs';
import { ObjectId } from 'mongodb';
import * as scheduler from 'node-schedule';
import * as db from '@lems/database';
import { JUDGING_SESSION_LENGTH } from '@lems/types';

export const handleStartSession = async (namespace, divisionId, roomId, sessionId, callback) => {
  let divisionState = await db.getEventState({ divisionId: new ObjectId(divisionId) });

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

  console.log(`❗ Starting session ${sessionId} for room ${roomId} in division ${divisionId}`);

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

  if (!divisionState.currentSession || session.number > divisionState.currentSession) {
    await db.updateEventState({ _id: divisionState._id }, { currentSession: session.number });
  }

  callback({ ok: true });
  session = await db.getSession({ _id });
  divisionState = await db.getEventState({ divisionId: new ObjectId(divisionId) });
  namespace.to('judging').emit('judgingSessionStarted', session, divisionState);
};

export const handleAbortSession = async (namespace, divisionId, roomId, sessionId, callback) => {
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

  console.log(`❌ Aborting session ${sessionId} for room ${roomId} in division ${divisionId}`);

  await db.updateSession({ _id: session._id }, { startTime: undefined, status: 'not-started' });

  callback({ ok: true });
  session = await db.getSession({ _id: new ObjectId(sessionId) });
  namespace.to('judging').emit('judgingSessionAborted', session);
};

export const handleUpdateSessionTeam = async (
  namespace,
  divisionId,
  sessionId,
  teamId,
  callback
) => {
  let session = await db.getSession({ _id: new ObjectId(sessionId) });

  if (!session) {
    callback({ ok: false, error: `Could not find session ${sessionId}!` });
    return;
  }
  if (session.status !== 'not-started') {
    callback({ ok: false, error: `Session ${sessionId} is not editable!` });
    return;
  }

  console.log(`🖊️ Updating team for session ${sessionId} in division ${divisionId}`);

  await db.updateSession({ _id: session._id }, { teamId: teamId ? new ObjectId(teamId) : null });

  callback({ ok: true });
  session = await db.getSession({ _id: new ObjectId(sessionId) });
  namespace.to('judging').emit('judgingSessionUpdated', session);
};

export const handleUpdateSession = async (namespace, divisionId, sessionId, data, callback) => {
  let session = await db.getSession({ _id: new ObjectId(sessionId) });
  if (!session) {
    callback({ ok: false, error: `Could not find session ${sessionId}!` });
    return;
  }
  if (session.status !== 'not-started') {
    callback({ ok: false, error: `Session ${sessionId} is not editable!` });
    return;
  }

  console.log(`🖊️ Updating session ${sessionId} in division ${divisionId}`);

  await db.updateSession({ _id: session._id }, { ...data });

  callback({ ok: true });
  session = await db.getSession({ _id: new ObjectId(sessionId) });
  namespace.to('judging').emit('judgingSessionUpdated', session);
};

export const handleUpdateRubric = async (
  namespace,
  divisionId,
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
      error: `Could not find session ${rubricId} for team ${teamId} in division ${divisionId}!`
    });
    return;
  }

  console.log(`🖊️ Updating rubric ${rubricId} for team ${teamId} in division ${divisionId}`);

  await db.updateRubric({ _id: rubric._id }, rubricData);

  callback({ ok: true });
  const oldRubric = rubric;
  rubric = await db.getRubric({ _id: new ObjectId(rubricId) });
  namespace.to('judging').emit('rubricUpdated', rubric);
  if (rubricData.status !== oldRubric.status)
    namespace.to('judging').emit('rubricStatusChanged', rubric);
};

export const handleCreateCvForm = async (namespace, divisionId, content, callback) => {
  console.log(`📄 Creating Core Values Form in division ${divisionId}`);
  const cvFormId = await db
    .addCoreValuesForm({ ...content, divisionId: new ObjectId(divisionId) })
    .then(result => result.insertedId);
  const cvForm = await db.getCoreValuesForm({ _id: cvFormId });

  callback({ ok: true });
  namespace.to('judging').emit('cvFormCreated', cvForm);
};

export const handleUpdateCvForm = async (namespace, divisionId, cvFormId, content, callback) => {
  let cvForm = await db.getCoreValuesForm({ _id: new ObjectId(cvFormId) });
  if (!cvForm) {
    callback({
      ok: false,
      error: `Could not find core values form ${cvFormId} in division ${divisionId}!`
    });
    return;
  }

  console.log(`🖊️ Updating core values form ${cvFormId} in division ${divisionId}`);

  await db.updateCoreValuesForm(
    { _id: cvForm._id },
    { ...content, divisionId: new ObjectId(divisionId) }
  );

  callback({ ok: true });
  cvForm = await db.getCoreValuesForm({ _id: new ObjectId(cvFormId) });
  namespace.to('judging').emit('cvFormUpdated', cvForm);
};

export const handleCallLeadJudge = async (namespace, divisionId, roomId, callback) => {
  const room = await db.getRoom({ _id: new ObjectId(roomId) });

  if (!room) {
    callback({ ok: false, error: `Could not find room ${roomId}!` });
    return;
  }

  console.log(`💁‍♂️ Lead judge called to room ${roomId} in division ${divisionId}`);
  callback({ ok: true });
  namespace.to('judging').emit('leadJudgeCalled', room);
};
