import express, { Response } from 'express';
import { z } from 'zod';
import { Division } from '@lems/database';
import { INSIGHTS_STAGES, InsightsEvent, InsightsExplorerQuerySchema } from '@lems/types/api/admin';
import db from '../../../lib/database';
import { requirePermission } from '../middleware/require-permission';
import { AdminRequest } from '../../../types/express';
import { asHandler, asMiddleware } from '../../../types/express-handlers';
import { getDivisionInsightsData } from './data';
import { computeJudging, computeOverview, computeRobotGame } from './dashboards';
import { runExplorerQuery } from './explorer';

const router = express.Router({ mergeParams: true });

router.use(requirePermission('VIEW_INSIGHTS'));

router.get(
  '/events',
  asHandler<AdminRequest>(async (req, res) => {
    const [events, seasons] = await Promise.all([db.events.getAllSummaries(), db.seasons.getAll()]);
    const seasonNames = new Map(seasons.map(season => [season.id, season.name]));

    const response: InsightsEvent[] = events
      .map(event => ({
        id: event.id,
        name: event.name,
        slug: event.slug,
        startDate: new Date(event.date),
        seasonId: event.season_id,
        seasonName: seasonNames.get(event.season_id) ?? null,
        completed: event.completed,
        divisions: event.divisions
      }))
      .sort((a, b) => b.startDate.getTime() - a.startDate.getTime());

    res.json(response);
  })
);

type InsightsLocals = { division: Division };

router.use(
  '/divisions/:divisionId',
  asMiddleware<AdminRequest>(async (req, res, next) => {
    const division = await db.divisions.byId(req.params.divisionId as string).get();
    if (!division) {
      res.status(404).json({ error: 'DIVISION_NOT_FOUND' });
      return;
    }

    const settings = await db.events.byId(division.event_id).getSettings();
    if (!settings?.completed) {
      res.status(409).json({ error: 'EVENT_NOT_COMPLETED' });
      return;
    }

    (res.locals as InsightsLocals).division = division;
    next();
  })
);

const getData = (res: Response) => getDivisionInsightsData((res.locals as InsightsLocals).division);

router.get(
  '/divisions/:divisionId/overview',
  asHandler<AdminRequest>(async (req, res) => {
    res.json(computeOverview(await getData(res)));
  })
);

const RobotGameQuerySchema = z.object({ stage: z.enum(INSIGHTS_STAGES).optional() });

router.get(
  '/divisions/:divisionId/robot-game',
  asHandler<AdminRequest>(async (req, res) => {
    const query = RobotGameQuerySchema.safeParse(req.query);
    if (!query.success) {
      res.status(400).json({ error: 'INVALID_QUERY', details: query.error.issues });
      return;
    }
    res.json(computeRobotGame(await getData(res), query.data.stage));
  })
);

router.get(
  '/divisions/:divisionId/judging',
  asHandler<AdminRequest>(async (req, res) => {
    res.json(computeJudging(await getData(res)));
  })
);

router.get(
  '/divisions/:divisionId/explore',
  asHandler<AdminRequest>(async (req, res) => {
    const query = InsightsExplorerQuerySchema.safeParse(req.query);
    if (!query.success) {
      res.status(400).json({ error: 'INVALID_QUERY', details: query.error.issues });
      return;
    }
    res.json(runExplorerQuery(await getData(res), query.data));
  })
);

export default router;
