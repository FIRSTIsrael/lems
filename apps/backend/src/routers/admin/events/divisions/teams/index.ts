import express from 'express';
import db from '../../../../../lib/database';
import { AdminDivisionRequest } from '../../../../../types/express';
import { makeAdminTeamResponse } from '../../../teams/util';import { asHandler } from '../../../../../types/express-handlers';


const router = express.Router({ mergeParams: true });

router.get('/', asHandler<AdminDivisionRequest>(async (req, res) => {
  const teams = await db.teams.byDivisionId(req.divisionId).getAll();
  res.json(teams.map(team => makeAdminTeamResponse(team)));
}));

export default router;
