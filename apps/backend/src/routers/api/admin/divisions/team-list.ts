import express, { Request, Response } from 'express';

import fileUpload from 'express-fileupload';
import { ObjectId } from 'mongodb';
import * as db from '@lems/database';
import { parseTeamList } from '../../../../lib/schedule/team-list-parser';

const router = express.Router({ mergeParams: true });

router.post('/', fileUpload(), async (req: Request, res: Response) => {
  const division = await db.getDivision({ _id: new ObjectId(req.params.divisionId) });
  if (!division) {
    res.status(404).json({ error: 'DIVISION_NOT_FOUND' });
    return;
  }

  try {
    console.log('👓 Parsing file...');
    const csvData = (req.files.file as fileUpload.UploadedFile)?.data.toString();
    const teams = parseTeamList(division, csvData);
    await db.deleteDivisionTeams(division._id);
    await db.addTeams(teams);
    console.log('Successfully uploaded team list');
    res.json({ ok: true });
  } catch (error) {
    console.log('❌ Error parsing team list');
    console.log(error);
    await db.deleteDivisionTeams(division._id);
    console.log('✅ Deleted division teams!');
    res.status(500).json({ error: 'INTERNAL_SERVER_ERROR' });
  }
});

export default router;
