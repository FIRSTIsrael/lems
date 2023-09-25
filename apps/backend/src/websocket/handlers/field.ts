import { ObjectId } from 'mongodb';
import * as scheduler from 'node-schedule';
import * as db from '@lems/database';
import dayjs from 'dayjs';
import { MATCH_LENGTH } from '@lems/types';

export const handleStartMatch = async (namespace, eventId, tableId, matchId, callback) => {
  const eventState = await db.getEventState({ event: new ObjectId(eventId) });

  const match = await db.getMatch({
    table: new ObjectId(tableId),
    _id: new ObjectId(matchId)
  });
  if (!match) {
    callback({ ok: false, error: `Could not find match ${matchId} in table ${tableId}!` });
    return;
  }
  if (match.status !== 'not-started') {
    callback({ ok: false, error: `Match ${matchId} has already started!` });
    return;
  }
  const tableMatches = await db.getTableMatches(new ObjectId(tableId));
  if (tableMatches.find(match => match.status === 'in-progress')) {
    callback({ ok: false, error: `Table ${tableId} already has a running match!` });
    return;
  }

  console.log(`❗ Starting match ${matchId} for table ${tableId} in event ${eventId}`);

  match.start = new Date();
  match.status = 'in-progress';
  const { _id, ...matchData } = match;
  await db.updateMatch({ _id: match._id }, matchData);

  const matchEnd: Date = dayjs().add(MATCH_LENGTH, 'seconds').toDate();
  scheduler.scheduleJob(
    matchEnd,
    function () {
      db.getMatch({ _id: new ObjectId(match._id) }).then(newMatch => {
        if (dayjs(newMatch.start).isSame(dayjs(match.start)) && newMatch.status === 'in-progress') {
          console.log(`✅ Match ${match._id} completed`);
          db.updateMatch({ _id: match._id }, { status: 'completed' });
          namespace.to('field').emit('matchCompleted', tableId, matchId);
        }
      });
    }.bind(null, match, [tableId])
  );

  if (!eventState.activeMatch || match.number > eventState.activeMatch) {
    await db.updateEventState({ _id: eventState._id }, { activeMatch: match.number });
  }

  callback({ ok: true });
  namespace.to('field').emit('matchStarted', tableId, matchId);
};

export const abortMatch = async (namespace, eventId, tableId, matchId, callback) => {
  const match = await db.getMatch({
    match: new ObjectId(tableId),
    _id: new ObjectId(matchId)
  });
  if (!match) {
    callback({ ok: false, error: `Could not find match ${matchId} in table ${tableId}!` });
    return;
  }
  if (match.status !== 'in-progress') {
    callback({ ok: false, error: `Match ${matchId} is not in progress!` });
    return;
  }

  console.log(`❌ Aborting match ${matchId} for table ${tableId} in event ${eventId}`);

  await db.updateMatch({ _id: match._id }, { start: undefined, status: 'not-started' });

  callback({ ok: true });
  namespace.to('field').emit('matchAborted', matchId);
};

export const handleUpdateMatch = async (
  namespace,
  eventId,
  tableId,
  matchId,
  matchData,
  callback
) => {
  const match = await db.getMatch({
    table: new ObjectId(tableId),
    _id: new ObjectId(matchId)
  });
  if (!match) {
    callback({
      ok: false,
      error: `Could not find match ${matchId} for table ${tableId} in event ${eventId}!`
    });
    return;
  }

  console.log(`🖊️ Updating match ${matchId} for table ${tableId} in event ${eventId}`);

  await db.updateMatch(
    {
      _id: match._id
    },
    matchData
  );

  callback({ ok: true });
  namespace.to('field').emit('matchUpdated', tableId, matchId);
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
