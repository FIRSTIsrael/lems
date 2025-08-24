import express from 'express';
import db from '../../../../../lib/database';
import { AdminDivisionRequest } from '../../../../../types/express';
import { makeAdminTeamResponse } from '../../../teams/util';

const router = express.Router({ mergeParams: true });

router.get('/', async (req: AdminDivisionRequest, res) => {
  const teams = await db.divisions.byId(req.divisionId).getTeams();
  res.json(teams.map(team => makeAdminTeamResponse(team)));
});

export default router;
