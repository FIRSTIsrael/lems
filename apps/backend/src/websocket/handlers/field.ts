import { ObjectId } from 'mongodb';
import * as scheduler from 'node-schedule';
import * as db from '@lems/database';
import dayjs from 'dayjs';
import { MATCH_LENGTH, RobotGameMatchParticipant, RobotGameMatchBrief } from '@lems/types';

export const handleLoadMatch = async (namespace, divisionId: string, matchId: string, callback) => {
  let match = await db.getMatch({
    divisionId: new ObjectId(divisionId),
    _id: new ObjectId(matchId)
  });

  if (!match) {
    callback({ ok: false, error: `Could not find match #${matchId} in division ${divisionId}!` });
    return;
  }

  console.log(`🔃 Loading match #${matchId} in division ${divisionId}`);

  await db.updateDivisionState(
    { divisionId: new ObjectId(divisionId) },
    {
      loadedMatch: match._id
    }
  );

  console.log(`✅ Loaded match #${matchId}!`);
  callback({ ok: true });
  match = await db.getMatch({ divisionId: new ObjectId(divisionId), _id: new ObjectId(matchId) });
  const divisionState = await db.getDivisionState({ divisionId: new ObjectId(divisionId) });
  namespace.to('field').emit('matchLoaded', match, divisionState);
};

export const handleStartMatch = async (
  namespace,
  divisionId: string,
  matchId: string,
  callback
) => {
  let divisionState = await db.getDivisionState({ divisionId: new ObjectId(divisionId) });
  if (divisionState.activeMatch !== null) {
    callback({
      ok: false,
      error: `Division already has a running match (${divisionState.activeMatch})!`
    });
    return;
  }

  console.log(`❗ Starting match ${matchId} in division ${divisionId}`);

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
        await db.updateDivisionState({ _id: divisionState._id }, { activeMatch: null });

        const match = await db.getMatch({ _id: new ObjectId(matchId) });
        divisionState = await db.getDivisionState({ divisionId: new ObjectId(divisionId) });
        namespace.to('field').emit('matchCompleted', match, divisionState);
      }
    }.bind(null, startTime)
  );

  scheduler.scheduleJob(
    dayjs(matchEnd).subtract(30, 'seconds').toDate(),
    async function () {
      const match = await db.getMatch({
        _id: new ObjectId(matchId),
        status: 'in-progress',
        startTime
      });

      if (match) {
        console.log(`🏃 Match ${matchId} endgame!`);
        divisionState = await db.getDivisionState({ divisionId: new ObjectId(divisionId) });
        namespace.to('field').emit('matchEndgame', match);
      }
    }.bind(null, startTime)
  );

  const match = await db.getMatch({ _id: new ObjectId(matchId) });
  const switchToRanking = match.stage === 'ranking' && divisionState.currentStage === 'practice';
  const advanceRound = switchToRanking || match.round > divisionState.currentRound;

  await db.updateDivisionState(
    { _id: divisionState._id },
    {
      activeMatch: match._id,
      ...(match.stage !== 'test' && { loadedMatch: null }),
      ...(switchToRanking && { currentStage: 'ranking' }),
      ...(advanceRound && { currentRound: match.round })
    }
  );

  divisionState = await db.getDivisionState({ divisionId: new ObjectId(divisionId) });
  callback({ ok: true });
  namespace.to('field').emit('matchStarted', match, divisionState);
};

export const handleStartTestMatch = async (namespace, divisionId: string, callback) => {
  const match = await db.getMatch({ divisionId: new ObjectId(divisionId), stage: 'test' });

  if (!match) {
    callback({
      ok: false,
      error: `Could not find test match`
    });
    return;
  }

  console.log(`❗ Starting test match ${match._id} in division ${divisionId}`);
  handleStartMatch(namespace, divisionId, match._id.toString(), callback);
};

export const handleAbortMatch = async (
  namespace,
  divisionId: string,
  matchId: string,
  callback
) => {
  let divisionState = await db.getDivisionState({ divisionId: new ObjectId(divisionId) });

  if (divisionState.activeMatch.toString() !== matchId) {
    callback({
      ok: false,
      error: `Match ${matchId} is not running!`
    });
    return;
  }

  console.log(`❌ Aborting match ${matchId} in division ${divisionId}`);

  let match = await db.getMatch({ _id: new ObjectId(matchId) });

  await db.updateMatch(
    {
      divisionId: new ObjectId(divisionId),
      _id: new ObjectId(matchId)
    },
    {
      status: 'not-started',
      startTime: undefined,
      ['participants.$[].ready']: false
    }
  );

  await db.updateDivisionState(
    { divisionId: new ObjectId(divisionId) },
    {
      activeMatch: null,
      ...(match.stage !== 'test' && { loadedMatch: new ObjectId(matchId) })
    }
  );

  callback({ ok: true });
  match = await db.getMatch({ divisionId: new ObjectId(divisionId), _id: new ObjectId(matchId) });
  divisionState = await db.getDivisionState({ divisionId: new ObjectId(divisionId) });

  namespace.to('field').emit('matchAborted', match, divisionState);
  if (match.stage !== 'test') namespace.to('field').emit('matchLoaded', match, divisionState);
};

export const handleUpdateMatchTeams = async (
  namespace,
  divisionId,
  matchId,
  newTeams,
  callback
) => {
  let match = await db.getMatch({ _id: new ObjectId(matchId) });

  if (!match) {
    callback({ ok: false, error: `Could not find match ${matchId}!` });
    return;
  }

  if (match.status !== 'not-started') {
    callback({ ok: false, error: `Match ${matchId} is not editable!` });
    return;
  }

  console.log(`🖊️ Updating teams for match ${matchId} in division ${divisionId}`);

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

export const handleSwitchMatchTeams = async (
  namespace,
  divisionId: string,
  fromMatchId: string,
  toMatchId: string,
  participantIndex: number,
  callback
) => {
  let fromMatch = await db.getMatch({ _id: new ObjectId(fromMatchId) });
  let toMatch = await db.getMatch({ _id: new ObjectId(toMatchId) });

  if (!fromMatch || !toMatch) {
    callback({ ok: false, error: `Could not find match(es) ${fromMatchId}/${toMatchId}!` });
    return;
  }

  if (fromMatch.status !== 'not-started' || toMatch.status !== 'not-started') {
    callback({ ok: false, error: `Match(es) ${fromMatchId}/${toMatchId} are not editable!` });
    return;
  }

  console.log(
    `🖊️ Switching teams with index ${participantIndex} from match ${fromMatchId} to match ${toMatchId} in division ${divisionId}`
  );

  await db.updateMatch(
    { _id: new ObjectId(fromMatchId) },
    { [`participants.${participantIndex}.teamId`]: toMatch.participants[participantIndex].teamId }
  );

  await db.updateMatch(
    { _id: new ObjectId(toMatchId) },
    { [`participants.${participantIndex}.teamId`]: fromMatch.participants[participantIndex].teamId }
  );

  callback({ ok: true });
  fromMatch = await db.getMatch({ _id: new ObjectId(fromMatchId) });
  toMatch = await db.getMatch({ _id: new ObjectId(toMatchId) });
  namespace.to('field').emit('matchUpdated', fromMatch);
  namespace.to('field').emit('matchUpdated', toMatch);
};

export const handleMergeMatches = async (
  namespace,
  divisionId: string,
  fromMatchId: string,
  toMatchId: string,
  callback
) => {
  let fromMatch = await db.getMatch({ _id: new ObjectId(fromMatchId) });
  let toMatch = await db.getMatch({ _id: new ObjectId(toMatchId) });

  if (!fromMatch || !toMatch) {
    callback({ ok: false, error: `Could not find match(es) ${fromMatchId}/${toMatchId}!` });
    return;
  }

  if (fromMatch.status !== 'not-started' || toMatch.status !== 'not-started') {
    callback({ ok: false, error: `Match(es) ${fromMatchId}/${toMatchId} are not editable!` });
    return;
  }

  console.log(`🔄 Merging match ${fromMatchId} into match ${toMatchId} in division ${divisionId}`);

  const fromMatchNewParticipants = fromMatch.participants.map(participant => ({
    ...participant,
    teamId: null
  }));

  const teamsToMerge = fromMatch.participants.filter(
    participant => participant.teamId && participant.team.registered
  );

  const toMatchNewParticipants = toMatch.participants.map(participant => {
    if (!participant.teamId || !participant.team.registered) {
      const { team, teamId, ...rest } = participant;
      return {
        ...rest,
        teamId: teamsToMerge.shift()?.teamId ?? null
      };
    }
    return participant;
  });

  await db.updateMatch(
    { _id: new ObjectId(fromMatchId) },
    { participants: fromMatchNewParticipants, status: 'completed' }
  );

  await db.updateMatch({ _id: new ObjectId(toMatchId) }, { participants: toMatchNewParticipants });

  callback({ ok: true });
  fromMatch = await db.getMatch({ _id: new ObjectId(fromMatchId) });
  toMatch = await db.getMatch({ _id: new ObjectId(toMatchId) });
  namespace.to('field').emit('matchUpdated', fromMatch);
  namespace.to('field').emit('matchUpdated', toMatch);
};

export const handleUpdateMatchParticipant = async (
  namespace,
  divisionId: string,
  matchId: string,
  {
    teamId,
    ...data
  }: { teamId: string } & Partial<Pick<RobotGameMatchParticipant, 'present' | 'ready'>>,
  callback
) => {
  let match = await db.getMatch({
    _id: new ObjectId(matchId),
    divisionId: new ObjectId(divisionId)
  });

  if (!match) {
    callback({
      ok: false,
      error: `Could not find match ${matchId} in division ${divisionId}!`
    });
    return;
  }

  console.log(
    `🖊️ Updating prestart data of team ${teamId} in match ${matchId} at division ${divisionId}`
  );

  await db.updateMatch(
    {
      _id: new ObjectId(matchId),
      divisionId: new ObjectId(divisionId),
      'participants.teamId': new ObjectId(teamId)
    },
    Object.fromEntries(
      Object.entries(data).map(([key, value]) => [`participants.$.${key}` as string, value])
    )
  );

  callback({ ok: true });
  match = await db.getMatch({ _id: new ObjectId(matchId), divisionId: new ObjectId(divisionId) });
  namespace.to('field').emit('matchUpdated', match);
};

export const handleUpdateMatchBrief = async (
  namespace,
  divisionId: string,
  matchId: string,
  newBrief: Partial<Pick<RobotGameMatchBrief, 'called'>>,
  callback
) => {
  let match = await db.getMatch({
    _id: new ObjectId(matchId),
    divisionId: new ObjectId(divisionId)
  });

  if (!match) {
    callback({
      ok: false,
      error: `Could not find match ${matchId} in division ${divisionId}!`
    });
    return;
  }

  console.log(`🖊️ Updating match data of match ${matchId} at division ${divisionId}`);

  await db.updateMatch(
    {
      _id: new ObjectId(matchId),
      divisionId: new ObjectId(divisionId)
    },
    { ...newBrief }
  );

  callback({ ok: true });
  match = await db.getMatch({ _id: new ObjectId(matchId), divisionId: new ObjectId(divisionId) });
  namespace.to('field').emit('matchUpdated', match);
};

export const handleUpdateScoresheet = async (
  namespace,
  divisionId,
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
      error: `Could not find scoresheet ${scoresheetId} for team ${teamId} in division ${divisionId}!`
    });
    return;
  }

  console.log(
    `🖊️ Updating scoresheet ${scoresheetId} for team ${teamId} in division ${divisionId}`
  );

  await db.updateScoresheet({ _id: scoresheet._id }, scoresheetData);

  callback({ ok: true });
  const oldScoresheet = scoresheet;
  scoresheet = await db.getScoresheet({ _id: new ObjectId(scoresheetId) });

  namespace.to('field').emit('scoresheetUpdated', scoresheet);
  if (scoresheetData.escalated === true && !oldScoresheet.escalated)
    namespace.to('field').emit('scoresheetEscalated', scoresheet);
};
