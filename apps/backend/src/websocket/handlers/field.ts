import { ObjectId } from 'mongodb';
import * as scheduler from 'node-schedule';
import * as db from '@lems/database';
import dayjs from 'dayjs';
import { MATCH_LENGTH, RobotGameMatchParticipant } from '@lems/types';

export const handleLoadMatch = async (namespace, eventId: string, matchId: string, callback) => {
  let match = await db.getMatch({
    eventId: new ObjectId(eventId),
    _id: new ObjectId(matchId)
  });
  if (!match) {
    callback({ ok: false, error: `Could not find match #${matchId} in event ${eventId}!` });
    return;
  }
  console.log(`🔃 Loading match #${matchId} in event ${eventId}`);

  await db.updateEventState(
    { eventId: new ObjectId(eventId) },
    {
      loadedMatch: match._id
    }
  );

  console.log(`✅ Loaded match #${matchId}!`);
  callback({ ok: true });
  match = await db.getMatch({ eventId: new ObjectId(eventId), _id: new ObjectId(matchId) });
  const eventState = await db.getEventState({ eventId: new ObjectId(eventId) });
  namespace.to('field').emit('matchLoaded', match, eventState);
};

export const handleStartMatch = async (namespace, eventId: string, matchId: string, callback) => {
  let eventState = await db.getEventState({ eventId: new ObjectId(eventId) });
  if (eventState.activeMatch !== null) {
    callback({
      ok: false,
      error: `Event already has a running match (${eventState.activeMatch})!`
    });
    return;
  }

  console.log(`❗ Starting match ${matchId} in event ${eventId}`);

  const startTime = new Date();
  await db.updateMatches(
    {
      _id: new ObjectId(matchId)
    },
    {
      status: 'in-progress',
      startTime
    }
  );

  const matchEnd: Date = dayjs().add(MATCH_LENGTH, 'seconds').toDate();
  scheduler.scheduleJob(
    matchEnd,
    async function () {
      const result = await db.updateMatches(
        {
          _id: new ObjectId(matchId),
          status: 'in-progress',
          startTime
        },
        {
          status: 'completed'
        }
      );

      if (result.matchedCount > 0) {
        console.log(`✅ Match ${matchId} completed!`);
        await db.updateEventState({ _id: eventState._id }, { activeMatch: null });

        const match = await db.getMatch({ _id: new ObjectId(matchId) });
        eventState = await db.getEventState({ eventId: new ObjectId(eventId) });
        namespace.to('field').emit('matchCompleted', match, eventState);
      }
    }.bind(null, startTime)
  );

  const match = await db.getMatch({ _id: new ObjectId(matchId) });

  await db.updateEventState(
    { _id: eventState._id },
    {
      activeMatch: match._id,
      loadedMatch: null,
      ...(match.stage === 'ranking' &&
        eventState.currentStage === 'practice' && { currentStage: 'ranking' })
    }
  );

  eventState = await db.getEventState({ eventId: new ObjectId(eventId) });
  callback({ ok: true });
  namespace.to('field').emit('matchStarted', match, eventState);
};

export const handleStartTestMatch = async (namespace, eventId: string, callback) => {
  const match = await db.getMatch({ eventId: new ObjectId(eventId), stage: 'test' });
  if (!match) {
    callback({
      ok: false,
      error: `Could not find test match`
    });
    return;
  }
  console.log(`❗ Starting test match ${match._id} in event ${eventId}`);

  handleStartMatch(namespace, eventId, match._id.toString(), callback);
};

export const handleAbortMatch = async (namespace, eventId: string, matchId: string, callback) => {
  let eventState = await db.getEventState({ eventId: new ObjectId(eventId) });
  if (eventState.activeMatch.toString() !== matchId) {
    callback({
      ok: false,
      error: `Match ${matchId} is not running!`
    });
    return;
  }

  console.log(`❌ Aborting match ${matchId} in event ${eventId}`);
  let match = await db.getMatch({ _id: new ObjectId(matchId) });

  if (match.stage !== 'test')
    await db.updateMatches(
      {
        eventId: new ObjectId(eventId),
        _id: new ObjectId(matchId)
      },
      {
        status: 'not-started',
        startTime: undefined
      }
    );

  await db.updateEventState(
    { eventId: new ObjectId(eventId) },
    {
      activeMatch: null,
      ...(match.stage !== 'test' && { loadedMatch: new ObjectId(matchId) })
    }
  );

  callback({ ok: true });
  match = await db.getMatch({ eventId: new ObjectId(eventId), _id: new ObjectId(matchId) });
  eventState = await db.getEventState({ eventId: new ObjectId(eventId) });
  namespace.to('field').emit('matchAborted', match, eventState);
  if (match.stage !== 'test') namespace.to('field').emit('matchLoaded', match, eventState);
};

export const handleUpdateMatchTeams = async (namespace, eventId, matchId, newTeams, callback) => {
  let match = await db.getMatch({ _id: new ObjectId(matchId) });

  if (!match) {
    callback({ ok: false, error: `Could not find match ${matchId}!` });
    return;
  }
  if (match.status !== 'not-started') {
    callback({ ok: false, error: `Match ${matchId} is not editable!` });
    return;
  }

  console.log(`🖊️ Updating teams for match ${matchId} in event ${eventId}`);

  newTeams.forEach(async newTeam => {
    const participantIndex = match.participants.findIndex(
      p => p.tableId.toString() === newTeam.tableId
    );
    await db.updateMatch(
      { _id: match._id },
      {
        [`participants.${participantIndex}.teamId`]: newTeam.teamId
          ? new ObjectId(newTeam.teamId)
          : null
      }
    );
  });

  callback({ ok: true });
  match = await db.getMatch({ _id: new ObjectId(matchId) });
  namespace.to('field').emit('matchUpdated', match);
};

export const handlePrestartMatchParticipant = async (
  namespace,
  eventId: string,
  matchId: string,
  {
    teamId,
    ...data
  }: { teamId: string } & Partial<Pick<RobotGameMatchParticipant, 'present' | 'ready'>>,
  callback
) => {
  let match = await db.getMatch({
    _id: new ObjectId(matchId),
    eventId: new ObjectId(eventId)
  });
  if (!match) {
    callback({
      ok: false,
      error: `Could not find match ${matchId} in event ${eventId}!`
    });
    return;
  }

  console.log(
    `🖊️ Updating prestart data of team ${teamId} in match ${matchId} at event ${eventId}`
  );

  await db.updateMatch(
    {
      _id: new ObjectId(matchId),
      eventId: new ObjectId(eventId),
      'participants.teamId': new ObjectId(teamId)
    },
    Object.fromEntries(
      Object.entries(data).map(([key, value]) => [`participants.$.${key}` as string, value])
    )
  );

  callback({ ok: true });
  match = await db.getMatch({ _id: new ObjectId(matchId), eventId: new ObjectId(eventId) });
  namespace.to('field').emit('matchUpdated', match);
};

export const handleUpdateScoresheet = async (
  namespace,
  eventId,
  teamId,
  scoresheetId,
  scoresheetData,
  callback
) => {
  let scoresheet = await db.getScoresheet({
    teamId: teamId ? new ObjectId(teamId) : null,
    _id: new ObjectId(scoresheetId)
  });
  if (!scoresheet) {
    callback({
      ok: false,
      error: `Could not find scoresheet ${scoresheetId} for team ${teamId} in event ${eventId}!`
    });
    return;
  }

  console.log(`🖊️ Updating scoresheet ${scoresheetId} for team ${teamId} in event ${eventId}`);

  await db.updateScoresheet({ _id: scoresheet._id }, scoresheetData);

  callback({ ok: true });
  scoresheet = await db.getScoresheet({ _id: new ObjectId(scoresheetId) });
  namespace.to('field').emit('scoresheetUpdated', scoresheet);
  if (scoresheetData.status !== scoresheet.status)
    namespace.to('field').emit('scoresheetStatusChanged', scoresheet);
};

export const handleUpdateAudienceDisplayState = async (
  namespace,
  eventId,
  newDisplayState,
  callback
) => {
  let eventState = await db.getEventState({ eventId: new ObjectId(eventId) });

  if (!eventState) {
    callback({
      ok: false,
      error: `Could not find event state in event ${eventId}!`
    });
    return;
  }

  if (eventState.audienceDisplayState === newDisplayState) {
    callback({
      ok: false,
      error: `Display state not updated!`
    });
    return;
  }

  await db.updateEventState(
    { eventId: new ObjectId(eventId) },
    { audienceDisplayState: newDisplayState }
  );

  eventState = await db.getEventState({ eventId: new ObjectId(eventId) });
  namespace.to('field').emit('audienceDisplayStateUpdated', eventState);
};
