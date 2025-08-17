import express from 'express';
import db from '../../../../lib/database';
import { requirePermission } from '../../../../middlewares/admin/require-permission';
import { AdminRequest } from '../../../../types/express';
import { makeAdminTeamResponse } from '../../teams/util';

// team event router
const router = express.Router({ mergeParams: true });

router.post(
  '/register',
  requirePermission('MANAGE_EVENT_DETAILS'),
  async (req: AdminRequest, res) => {
    const { teams } = req.body;
  }
);

router.get('/', async (req: AdminRequest, res) => {
  const event = await db.events.bySlug(req.params.slug).get();

  if (!event) {
    res.status(404).json({ error: 'Event not found' });
    return;
  }

  const teams = await db.teams.byEvent(event.id).getAll();

  res.json(teams.map(team => makeAdminTeamResponse(team)));
});

export default router;
