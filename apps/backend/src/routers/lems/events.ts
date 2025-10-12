import express, { Request, Response } from 'express';
import db from '../../lib/database';

const router = express.Router({ mergeParams: true });

router.get('/:eventSlug', async (req: Request, res: Response) => {
  const { eventSlug } = req.params;

  const event = await db.events.bySlug(eventSlug).get();

  if (!event) {
    res.status(404).json({ error: 'EVENT_NOT_FOUND' });
    return;
  }

  const divisions = await db.divisions.byEventId(event.id).getAll();

  res.json({
    id: event.id,
    name: event.name,
    slug: event.slug,
    startDate: event.start_date.toISOString(),
    endDate: event.end_date.toISOString(),
    location: event.location,
    seasonId: event.season_id,
    divisions: divisions.map(div => ({
      id: div.id,
      name: div.name,
      color: div.color
    }))
  });
});

export default router;
