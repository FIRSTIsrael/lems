import express from 'express';
import db from '../../../lib/database';

const router = express.Router({ mergeParams: true });

router.get('/', async (req, res) => {
  const events = await db.events.getAll();
  res.json(events);
});

export default router;
