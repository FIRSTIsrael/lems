import { ObjectId } from 'mongodb';
import express, { Request, Response } from 'express';

import * as db from '@lems/database';
import { getLemsWebpageAsPdf } from '../../../../lib/export';

const router = express.Router({ mergeParams: true });

router.use((req, res, next) => {
  db.getDivisionState({ divisionId: req.division._id }).then(divisionState => {
    if (!divisionState.allowTeamExports) return res.status(403).json('OPERATION_NOT_ALLOWED');
    next();
  });
});

router.get('/rubrics', async (req: Request, res: Response) => {
  const team = await db.getTeam({
    divisionId: new ObjectId(req.division._id),
    number: Number(req.teamNumber)
  });
  if (!team) {
    res.status(400).json({ error: 'BAD_REQUEST' });
    return;
  }

  const pdf = await getLemsWebpageAsPdf(
    `/lems/export/${team._id}/rubrics?divisionId=${team.divisionId}`
  );

  res.contentType('application/pdf');
  res.send(pdf);
});

router.get('/scoresheets', async (req: Request, res: Response) => {
  const team = await db.getTeam({
    divisionId: new ObjectId(req.division._id),
    number: Number(req.teamNumber)
  });
  if (!team) {
    res.status(400).json({ error: 'BAD_REQUEST' });
    return;
  }

  const pdf = await getLemsWebpageAsPdf(
    `/lems/export/${team._id}/scoresheets?divisionId=${team.divisionId}`
  );

  res.contentType('application/pdf');
  res.send(pdf);
});

router.get('/awards', async (req: Request, res: Response) => {
  const team = await db.getTeam({
    divisionId: new ObjectId(req.division._id),
    number: Number(req.teamNumber)
  });
  if (!team) {
    res.status(400).json({ error: 'BAD_REQUEST' });
    return;
  }

  const pdf = await getLemsWebpageAsPdf(
    `/lems/export/${team._id}/awards?divisionId=${team.divisionId}`,
    {
      format: 'A4',
      landscape: true,
      margin: {
        top: '0in',
        right: '0in',
        bottom: '0in',
        left: '0in'
      },
      printBackground: true
    }
  );

  res.contentType('application/pdf');
  res.send(pdf);
});

export default router;
