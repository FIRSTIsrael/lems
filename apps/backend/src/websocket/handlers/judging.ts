import dayjs from 'dayjs';
import { WithId, ObjectId } from 'mongodb';
import * as scheduler from 'node-schedule';
import * as db from '@lems/database';
import { JUDGING_SESSION_LENGTH, Award, Team, AwardNames, CoreValuesForm } from '@lems/types';

export const handleStartSession = async (
  namespace: any,
  divisionId: string,
  roomId,
  sessionId,
  callback
) => {
  let divisionState = await db.getDivisionState({ divisionId: new ObjectId(divisionId) });

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
    await db.updateDivisionState({ _id: divisionState._id }, { currentSession: session.number });
  }

  callback({ ok: true });
  session = await db.getSession({ _id });
  divisionState = await db.getDivisionState({ divisionId: new ObjectId(divisionId) });
  namespace.to('judging').emit('judgingSessionStarted', session, divisionState);
};

export const handleAbortSession = async (
  namespace: any,
  divisionId: string,
  roomId,
  sessionId,
  callback
) => {
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
  divisionId: string,
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

export const handleUpdateSession = async (
  namespace: any,
  divisionId: string,
  sessionId,
  data,
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

  console.log(`🖊️ Updating session ${sessionId} in division ${divisionId}`);

  await db.updateSession({ _id: session._id }, { ...data });

  callback({ ok: true });
  session = await db.getSession({ _id: new ObjectId(sessionId) });
  namespace.to('judging').emit('judgingSessionUpdated', session);
};

export const handleStartDeliberation = async (
  namespace: any,
  divisionId: string,
  deliberationId,
  callback
) => {
  let deliberation = await db.getJudgingDeliberation({
    divisionId: new ObjectId(divisionId),
    _id: new ObjectId(deliberationId)
  });
  if (!deliberation) {
    callback({
      ok: false,
      error: `Could not find deliberation ${deliberationId} in division ${divisionId}!`
    });
    return;
  }
  if (deliberation.status !== 'not-started') {
    callback({ ok: false, error: `Deliberation ${deliberationId} has already started!` });
    return;
  }

  console.log(`❗ Starting deliberation ${deliberationId} in division ${divisionId}`);

  const startTime = new Date();
  deliberation.startTime = startTime;
  deliberation.status = 'in-progress';
  const { _id, ...deliberationData } = deliberation;
  await db.updateJudgingDeliberation({ _id }, deliberationData);

  callback({ ok: true });
  deliberation = await db.getJudgingDeliberation({ _id });
  namespace.to('judging').emit('judgingDeliberationStarted', deliberation);
};

export const handleUpdateDeliberation = async (
  namespace,
  divisionId: string,
  deliberationId,
  data,
  callback
) => {
  let deliberation = await db.getJudgingDeliberation({ _id: new ObjectId(deliberationId) });
  if (!deliberation) {
    callback({ ok: false, error: `Could not find deliberation ${deliberationId}!` });
    return;
  }
  if (deliberation.status === 'completed') {
    callback({ ok: false, error: `Deliberation ${deliberationId} is not editable!` });
    return;
  }

  console.log(`🖊️ Updating deliberation ${deliberationId} in division ${divisionId}`);

  await db.updateJudgingDeliberation({ _id: deliberation._id }, { ...data });

  callback({ ok: true });
  const oldDeliberation = { ...deliberation };
  deliberation = await db.getJudgingDeliberation({ _id: new ObjectId(deliberationId) });
  namespace.to('judging').emit('judgingDeliberationUpdated', deliberation);
  if (deliberation.status !== oldDeliberation.status)
    namespace.to('judging').emit('judgingDeliberationStatusChanged', deliberation);
};

export const handleCompleteDeliberation = async (
  namespace,
  divisionId: string,
  deliberationId,
  data,
  callback
) => {
  handleUpdateDeliberation(
    namespace,
    divisionId,
    deliberationId,
    { ...data, status: 'completed', completionTime: new Date() },
    callback
  );
};

export const handleUpdateRubric = async (
  namespace,
  divisionId: string,
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

export const handleCreateCvForm = async (namespace: any, divisionId: string, content, callback) => {
  console.log(`📄 Creating Core Values Form in division ${divisionId}`);
  const { observerAffiliation, demonstratorAffiliation } = content as Partial<CoreValuesForm>;
  if (observerAffiliation) content.observerAffiliation._id = new ObjectId(observerAffiliation._id);
  if (demonstratorAffiliation)
    content.demonstratorAffiliation._id = new ObjectId(demonstratorAffiliation._id);
  const cvFormId = await db
    .addCoreValuesForm({ ...content, divisionId: new ObjectId(divisionId) })
    .then(result => result.insertedId);
  const cvForm = await db.getCoreValuesForm({ _id: cvFormId });

  callback({ ok: true });
  namespace.to('judging').emit('cvFormCreated', cvForm);
};

export const handleUpdateCvForm = async (
  namespace: any,
  divisionId: string,
  cvFormId,
  content,
  callback
) => {
  let cvForm = await db.getCoreValuesForm({ _id: new ObjectId(cvFormId) });
  if (!cvForm) {
    callback({
      ok: false,
      error: `Could not find core values form ${cvFormId} in division ${divisionId}!`
    });
    return;
  }

  console.log(`🖊️ Updating core values form ${cvFormId} in division ${divisionId}`);

  const { observerAffiliation, demonstratorAffiliation } = content as Partial<CoreValuesForm>;
  if (observerAffiliation) content.observerAffiliation._id = new ObjectId(observerAffiliation._id);
  if (demonstratorAffiliation)
    content.demonstratorAffiliation._id = new ObjectId(demonstratorAffiliation._id);

  await db.updateCoreValuesForm(
    { _id: cvForm._id },
    { ...content, divisionId: new ObjectId(divisionId) }
  );

  callback({ ok: true });
  cvForm = await db.getCoreValuesForm({ _id: new ObjectId(cvFormId) });
  namespace.to('judging').emit('cvFormUpdated', cvForm);
};

export const handleCallLeadJudge = async (namespace: any, divisionId: string, roomId, callback) => {
  const room = await db.getRoom({ _id: new ObjectId(roomId) });

  if (!room) {
    callback({ ok: false, error: `Could not find room ${roomId}!` });
    return;
  }

  console.log(`💁‍♂️ Lead judge called to room ${roomId} in division ${divisionId}`);
  callback({ ok: true });
  namespace.to('judging').emit('leadJudgeCalled', room);
};

export const handleUpdateAwardWinners = async (
  namespace: any,
  divisionId: string,
  data,
  callback
) => {
  const body = data as Record<AwardNames, Array<WithId<Team> | string>>;
  let awards = await db.getDivisionAwards(new ObjectId(divisionId));
  if (!awards) {
    callback({ ok: false, error: `Error getting awards for division ${divisionId}!` });
    return;
  }
  if (!Object.keys(body).every(awardName => awards.some(award => award.name === awardName))) {
    callback({ ok: false, error: `Invalid award name provided!` });
    return;
  }
  if (
    !Object.entries(body).every(
      ([awardName, winners]) => winners.length === awards.filter(a => a.name === awardName).length
    )
  ) {
    callback({ ok: false, error: `Invalid number of winners!` });
    return;
  }

  const newAwards = [];
  Object.entries(body).forEach(([awardName, winners]) => {
    const updatedAward = [...awards].filter(a => a.name === awardName);
    updatedAward
      .sort((a, b) => a.place - b.place)
      .forEach((award, index) => newAwards.push({ ...award, winner: winners[index] }));
  });

  console.log(`🏆 Updating winners for awards in division ${divisionId}`);

  await Promise.all(
    newAwards.map(async (award: WithId<Award>) => {
      if (!(await db.updateAward({ _id: award._id }, { winner: award.winner })).acknowledged)
        return callback({ ok: false, error: `Error while updating awards!` });
    })
  );

  callback({ ok: true });
  awards = await db.getDivisionAwards(new ObjectId(divisionId));
  namespace.to('judging').emit('awardsUpdated', awards);
};

export const handleAdvanceTeams = async (
  namespace: any,
  divisionId: string,
  teams: Array<WithId<Team>>,
  callback
) => {
  let awards = await db.getDivisionAwards(new ObjectId(divisionId));
  if (!awards) {
    callback({ ok: false, error: `Error getting awards for division ${divisionId}!` });
    return;
  }

  const advancementAwards: Array<Award> = teams.map((team, index) => ({
    divisionId: new ObjectId(divisionId),
    name: 'advancement',
    index: -1,
    place: index + 1,
    winner: team
  }));

  console.log(`🏆 Setting advancing teams for division ${divisionId}`);
  await db.deleteAwards({ divisionId: new ObjectId(divisionId), name: 'advancement' });
  await db.addAwards(advancementAwards);
  callback({ ok: true });
  awards = await db.getDivisionAwards(new ObjectId(divisionId));
  namespace.to('judging').emit('awardsUpdated', awards);
};

export const handleDisqualifyTeam = async (
  namespace: any,
  divisionId: string,
  teamId: string,
  callback
) => {
  const team = await db.getTeam({
    divisionId: new ObjectId(divisionId),
    _id: new ObjectId(teamId)
  });
  if (!team) {
    callback({ ok: false, error: `Could not find team ${teamId} in division ${divisionId}!` });
    return;
  }

  console.log(team);

  console.log(`🚫 Disqualifying team ${teamId} in division ${divisionId}`);
  const deliberations = await db.getJudgingDeliberationsFromDivision(new ObjectId(divisionId));
  for (const deliberation of deliberations) {
    if (deliberation.status === 'completed') continue;
    const updatedDisqualification = [...(deliberation.disqualifications || []), team._id];
    const updatedAwards = Object.entries(deliberation.awards).reduce(
      (acc, [awardName, picklist]) => {
        const _picklist = picklist as unknown as Array<string>;
        acc[awardName as AwardNames] = _picklist.includes(teamId)
          ? picklist.filter(id => String(id) !== teamId)
          : [...picklist];
        return acc;
      },
      {} as { [key in AwardNames]: Array<ObjectId> }
    );

    const result = await db.updateJudgingDeliberation(
      { _id: deliberation._id },
      { disqualifications: updatedDisqualification, awards: updatedAwards }
    );
    if (!result.acknowledged) {
      callback({ ok: false, error: `Error while updating deliberation ${deliberation._id}!` });
      return;
    }
    const newDeliberation = await db.getJudgingDeliberation({ _id: deliberation._id });
    namespace.to('judging').emit('judgingDeliberationUpdated', newDeliberation);
  }

  callback({ ok: true });
};
