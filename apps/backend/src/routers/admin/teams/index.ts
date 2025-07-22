import express from 'express';
import db from '../../../lib/database';
import { AdminRequest } from '../../../types/express';
import { makeAdminTeamResponse } from './util';

const router = express.Router({ mergeParams: true });

router.get('/', async (req: AdminRequest, res) => {
  const teams = await db.teams.getAll();
  res.json(teams.map(team => makeAdminTeamResponse(team)));
});

export default router;
