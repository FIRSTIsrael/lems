import express, { Request, Response } from 'express';

import { ObjectId } from 'mongodb';
import * as db from '@lems/database';
import { PortalActivity, PortalAward, PortalScore, PortalTeam } from '@lems/types';
import teamValidator from '../../../../middlewares/old-portal/team-validator';
import divisionCompleted from '../../../../middlewares/old-portal/division-completed';

const router = express.Router({ mergeParams: true });

router.get('/', async (req: Request, res: Response) => {
  const teams = await db.getDivisionTeams(new ObjectId(req.params.divisionId));
  const result: Array<PortalTeam> = teams.map(team => {
    const { _id, number, name, affiliation } = team;
    return { id: String(_id), number, name, affiliation };
  });

  res.json(result);
});

router.use('/:teamNumber', teamValidator);

router.get('/:teamNumber', async (req: Request, res: Response) => {
  const { _id, number, name, affiliation } = req.team;
  res.json({ id: String(_id), number, name, affiliation });
});

router.get('/:teamNumber/schedule', async (req: Request, res: Response) => {
  const teamMatches = await db
    .findMatches({
      'participants.teamId': new ObjectId(req.team._id)
    })
    .toArray();

  const matches: Array<PortalActivity<'match'>> = [];
  for (const match of teamMatches) {
    const { status, stage, round, number, scheduledTime } = match;

    // Not null since we're filtering by teamId
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const tableId = match.participants.find(participant =>
      participant.teamId?.equals(req.team._id)
    )!.tableId;

    const table = (await db.getTable({ _id: tableId })).name;

    matches.push({ type: 'match', status, stage, round, number, table, time: scheduledTime });
  }

  const teamSession = await db.getSession({ teamId: new ObjectId(req.team._id) });
  const { status, number, scheduledTime, roomId } = teamSession;
  const room = (await db.getRoom({ _id: roomId })).name;
  const session: PortalActivity<'session'> = {
    type: 'session',
    status,
    number,
    room,
    time: scheduledTime
  };

  const generalActivities: Array<PortalActivity<'general'>> = (req.division.schedule ?? [])
    .filter(entry => entry.showOnDashboard)
    .map(({ name, startTime }) => ({ type: 'general', name, time: startTime }));

  const result: Array<PortalActivity<'match' | 'session' | 'general'>> = [
    ...matches,
    session,
    ...generalActivities
  ].sort((a, b) => a.time.getTime() - b.time.getTime());

  res.json(result);
});

router.get('/:teamNumber/awards', divisionCompleted, async (req: Request, res: Response) => {
  const awards = await db.getTeamAwards(new ObjectId(req.team._id));
  const result: Array<PortalAward> = awards.map(award => {
    const { name, place } = award;

    let winner: PortalTeam | string | undefined;
    if (typeof award.winner === 'string') {
      winner = award.winner;
    } else {
      const { _id, number, name, affiliation } = award.winner;
      winner = { id: String(_id), number, name, affiliation };
    }

    return { name, place, winner };
  });

  res.json(result);
});

router.get('/:teamNumber/scores', async (req: Request, res: Response) => {
  const divisionState = await db.getDivisionState({
    divisionId: new ObjectId(req.division._id)
  });

  if (!divisionState) {
    res.status(404).send('Event/Division state not found');
    return;
  }

  const { _id, number, name, affiliation } = req.team;
  const team = { id: String(_id), number, name, affiliation };
  let scoresheets = await db.getTeamScoresheets(new ObjectId(req.team._id));
  scoresheets = scoresheets.filter(scoresheet => scoresheet.stage === divisionState.currentStage);

  const scores: Array<number> = scoresheets.map(scoresheet => {
    if (
      scoresheet.status !== 'ready' ||
      scoresheet.data.score === undefined ||
      scoresheet.data.score === null
    ) {
      return null;
    }

    return scoresheet.data.score;
  });

  const result: PortalScore = { team, scores, maxScore: Math.max(...scores) };

  res.json(result);
});

export default router;
