import { ObjectId } from 'mongodb';
import * as scheduler from 'node-schedule';
import * as db from '@lems/database';
import dayjs from 'dayjs';
import { MATCH_LENGTH, RobotGameMatch } from '@lems/types';

export const handleLoadMatch = async (
  namespace,
  eventId: string,
  matchNumber: number,
  callback
) => {
  const match = await db.getMatch({
    eventId: new ObjectId(eventId),
    number: matchNumber
  });
  if (!match) {
    callback({ ok: false, error: `Could not find match #${matchNumber}!` });
    return;
  }

  await db.updateEventState(
    { event: new ObjectId(eventId) },
    {
      loadedMatch: matchNumber
    }
  );

  callback({ ok: true });
  namespace.to('field').emit('matchLoaded', matchNumber);
};

export const handleStartMatch = async (
  namespace,
  eventId: string,
  matchNumber: number,
  callback
) => {
  const eventState = await db.getEventState({ event: new ObjectId(eventId) });
  if (eventState.activeMatch !== null) {
    callback({
      ok: false,
      error: `Event already has a running match (#${eventState.activeMatch})!`
    });
    return;
  }

  console.log(`❗ Starting match #${matchNumber} in event ${eventId}`);

  const startTime = new Date();
  await db.updateMatches(
    {
      eventId: new ObjectId(eventId),
      number: matchNumber
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
        eventId: new ObjectId(eventId),
        number: matchNumber,
        status: 'in-progress',
        startTime
      },
      {
        status: 'scoring'
      }
    );

    if (result.matchedCount > 0) {
      console.log(`✅ Match ${matchNumber} completed!`);
      db.updateEventState({ _id: eventState._id }, { activeMatch: null });
      namespace.to('field').emit('matchCompleted', matchNumber);
    }
  });

  await db.updateEventState(
    { _id: eventState._id },
    {
      activeMatch: matchNumber,
      loadedMatch: null
    }
  );

  callback({ ok: true });
  namespace.to('field').emit('matchStarted', { matchNumber, startedAt: startTime });
};

export const handleAbortMatch = async (
  namespace,
  eventId: string,
  matchNumber: number,
  callback
) => {
  const eventState = await db.getEventState({ event: new ObjectId(eventId) });
  if (eventState.activeMatch !== matchNumber) {
    callback({
      ok: false,
      error: `Match #${matchNumber} is not running!`
    });
    return;
  }

  console.log(`❌ Aborting match ${matchNumber} in event ${eventId}`);

  await db.updateMatches(
    {
      eventId: new ObjectId(eventId),
      number: matchNumber
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
      loadedMatch: matchNumber
    }
  );

  callback({ ok: true });
  namespace.to('field').emit('matchAborted', matchNumber);
  namespace.to('field').emit('matchLoaded', matchNumber);
};

export const handleUpdateMatch = async (
  namespace,
  eventId: string,
  matchId: string,
  matchData: Partial<RobotGameMatch>,
  callback
) => {
  const match = await db.getMatch({
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
  namespace.to('field').emit('matchUpdated', matchId);
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
    team: new ObjectId(teamId),
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
