import express, { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { ObjectId } from 'mongodb';
import dayjs from 'dayjs';
import * as db from '@lems/database';
import { PortalActivity, PortalSchedule, RobotGameMatch } from '@lems/types';

const router = express.Router({ mergeParams: true });

router.get('/', (req: Request, res: Response) => {
  const generalActivities: Array<PortalActivity<'general'>> = (req.division.schedule ?? []).map(
    ({ name, startTime }) => ({ type: 'general', name, time: startTime })
  );
  res.json(generalActivities);
});

router.get(
  '/judging',
  asyncHandler(async (req: Request, res: Response) => {
    const sessions = await db.getDivisionSessions(new ObjectId(req.division._id));
    if (!sessions) {
      res.status(404).send('Sessions not found');
      return;
    }

    const rooms = await db.getDivisionRooms(new ObjectId(req.division._id));
    if (!rooms) {
      res.status(404).send('Rooms not found');
      return;
    }

    const teams = await db.getDivisionTeams(new ObjectId(req.division._id));
    if (!teams) {
      res.status(404).send('Teams not found');
      return;
    }

    const columns = rooms.map(room => ({ id: String(room._id), name: room.name }));

    // Group sessions by scheduled time, sort array by rooms
    const rows = {};

    for (const session of sessions) {
      const startTime = dayjs(session.scheduledTime).format('HH:mm');
      const team = teams.find(team => String(team._id) === String(session.teamId));
      const room = rooms.find(room => String(room._id) === String(session.roomId));

      if (!room) {
        res.status(404).send('Room not found');
        return;
      }

      if (!team) {
        rows[startTime].data.push(null);
        continue;
      }
      const { _id, number, name, affiliation } = team;

      if (rows[startTime] === undefined) {
        rows[startTime] = { number: session.number, data: [] };
      }
      rows[startTime].data.push({
        id: String(_id),
        number,
        name,
        affiliation,
        column: String(room._id)
      });
    }

    res.json({ columns, rows, type: 'judging' });
  })
);

router.get(
  '/field',
  asyncHandler(async (req: Request, res: Response) => {
    const matches = (await db.getDivisionMatches(new ObjectId(req.division._id)))
      .filter(match => match.stage !== 'test')
      .sort((a, b) => a.scheduledTime.getDate() - b.scheduledTime.getDate());

    if (!matches) {
      res.status(404).send('Matches not found');
      return;
    }

    const tables = await db.getDivisionTables(new ObjectId(req.division._id));
    if (!tables) {
      res.status(404).send('Tables not found');
      return;
    }

    const teams = await db.getDivisionTeams(new ObjectId(req.division._id));
    if (!teams) {
      res.status(404).send('Teams not found');
      return;
    }

    const columns = tables.map(table => ({ id: String(table._id), name: table.name }));

    const matchesWithStages = matches.reduce<Record<string, Record<number, PortalSchedule>>>(
      (acc, match) => {
        const matchTeams = tables.map(table => {
          const team = teams.find(team =>
            match.participants.find(
              p => String(p.tableId) === String(table._id) && String(p.teamId) === String(team._id)
            )
          );
          if (!team) return null;
          const { _id, number, name, affiliation } = team;
          return team
            ? { id: String(_id), number, name, affiliation, column: String(table._id) }
            : null;
        });

        if (!acc[match.stage][match.round]) {
          acc[match.stage][match.round] = { columns, rows: {} };
        }
        acc[match.stage][match.round].rows[dayjs(match.scheduledTime).format('HH:mm')] = {
          number: match.number,
          data: matchTeams
        };
        return acc;
      },
      { practice: {}, ranking: {} }
    );

    const rounds = Object.entries(matchesWithStages).flatMap(([stage, rounds]) =>
      Object.entries(rounds).map(([number, schedule]) => ({
        stage,
        number: Number(number),
        schedule
      }))
    );

    res.json({ rounds, type: 'field' });
  })
);

export default router;
