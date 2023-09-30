import { ObjectId } from 'mongodb';
import * as scheduler from 'node-schedule';
import * as db from '@lems/database';
import dayjs from 'dayjs';
import { MATCH_LENGTH, RobotGameMatch } from '@lems/types';

export const handleLoadMatch = async (namespace, eventId: string, matchId: string, callback) => {
  let match = await db.getMatch({
    eventId: new ObjectId(eventId),
    _id: new ObjectId(matchId)
  });
  if (!match) {
    callback({ ok: false, error: `Could not find match #${matchId} in event ${eventId}!` });
    return;
  }
  console.log(`🧑‍🍳🔃 Loading match #${matchId} in event ${eventId}`);

  await db.updateEventState(
    { event: new ObjectId(eventId) },
    {
      loadedMatch: match._id
    }
  );

  console.log(`✅ Loaded match #${matchId}!`);
  callback({ ok: true });
  match = await db.getMatch({ eventId: new ObjectId(eventId), _id: new ObjectId(matchId) });
  const eventState = await db.getEventState({ event: new ObjectId(eventId) });
  namespace.to('field').emit('matchLoaded', match, eventState);
};

export const handleStartMatch = async (namespace, eventId: string, matchId: string, callback) => {
  let eventState = await db.getEventState({ event: new ObjectId(eventId) });
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
  scheduler.scheduleJob(matchEnd, async () => {
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
      db.updateEventState({ _id: eventState._id }, { activeMatch: null });

      const match = await db.getMatch({ _id: new ObjectId(matchId) });
      eventState = await db.getEventState({ event: new ObjectId(eventId) });
      namespace.to('field').emit('matchCompleted', match, eventState);
    }
  });

  const match = await db.getMatch({ _id: new ObjectId(matchId) });

  await db.updateEventState(
    { _id: eventState._id },
    {
      activeMatch: match._id,
      loadedMatch: null
    }
  );

  eventState = await db.getEventState({ event: new ObjectId(eventId) });
  callback({ ok: true });
  namespace.to('field').emit('matchStarted', match, eventState);
};

export const handleAbortMatch = async (namespace, eventId: string, matchId: string, callback) => {
  let eventState = await db.getEventState({ event: new ObjectId(eventId) });
  if (eventState.activeMatch.toString() !== matchId) {
    callback({
      ok: false,
      error: `Match ${matchId} is not running!`
    });
    return;
  }

  console.log(`❌ Aborting match ${matchId} in event ${eventId}`);

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
    { event: new ObjectId(eventId) },
    {
      activeMatch: null,
      loadedMatch: new ObjectId(matchId)
    }
  );

  callback({ ok: true });
  const match = await db.getMatch({ eventId: new ObjectId(eventId), _id: new ObjectId(matchId) });
  eventState = await db.getEventState({ event: new ObjectId(eventId) });
  namespace.to('field').emit('matchAborted', match, eventState);
  namespace.to('field').emit('matchLoaded', match, eventState);
};

export const handleUpdateMatch = async (
  namespace,
  eventId: string,
  matchId: string,
  matchData: Partial<RobotGameMatch>,
  callback
) => {
  let match = await db.getMatch({
    _id: new ObjectId(matchId)
  });
  if (!match) {
    callback({
      ok: false,
      error: `Could not find match ${matchId} in event ${eventId}!`
    });
    return;
  }

  console.log(`🖊️ Updating match ${matchId} in event ${eventId}`);

  await db.updateMatch(
    {
      _id: match._id
    },
    matchData
  );

  callback({ ok: true });
  match = await db.getMatch({ _id: new ObjectId(matchId) });
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
  const scoresheet = await db.getScoresheet({
    teamId: new ObjectId(teamId),
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

  namespace.to('field').emit('scoresheetUpdated', teamId, scoresheetId);

  if (scoresheetData.status !== scoresheet.status)
    namespace.to('field').emit('scoresheetStatusChanged', scoresheetId);
};
