import express, { Request, Response } from 'express';
import dayjs from 'dayjs';
import db from '../../../lib/database';
import { makeLemsEventResponse } from './util';

const router = express.Router({ mergeParams: true });

router.get('/live', async (req: Request, res: Response) => {
  const oneDayAgo = dayjs().subtract(1, 'day');
  const events = await db.events.after(oneDayAgo.unix()).getAll();

  const liveEvents = events.filter(event => {
    const startDate = dayjs(event.start_date);
    const endDate = dayjs(event.end_date);
    const now = dayjs();
    return now.isAfter(startDate) && now.isBefore(endDate);
  });

  res.json(liveEvents.map(makeLemsEventResponse));
});

router.get('/upcoming', async (req: Request, res: Response) => {
  const endOfDay = dayjs().endOf('day');
  const events = await db.events.after(endOfDay.unix()).getAll();
  res.json(events.map(makeLemsEventResponse));
});

router.get('/:eventSlug', async (req: Request, res: Response) => {
  const { eventSlug } = req.params;
  const event = await db.events.bySlug(eventSlug).get();

  if (!event) {
    res.status(404).json({ message: 'Event not found' });
    return;
  }

  res.json(makeLemsEventResponse(event));
});

export default router;
