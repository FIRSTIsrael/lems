import express from 'express';
import db from '../../../../../lib/database';
import { requirePermission } from '../../../../../middlewares/admin/require-permission';
import { AdminDivisionRequest } from '../../../../../types/express';
import { makeAdminAwardResponse } from './utils';

const router = express.Router({ mergeParams: true });

router.get('/', async (req: AdminDivisionRequest, res) => {
  const awards = await db.awards.byDivisionId(req.divisionId).getAll();
  res.status(200).json(awards.map(award => makeAdminAwardResponse(award)));
});

router.post(
  '/schema',
  requirePermission('MANAGE_EVENT_DETAILS'),
  async (req: AdminDivisionRequest, res) => {
    const awards = req.body.awards;
    if (!Array.isArray(awards)) {
      res.status(400).json({ error: 'Awards array is required' });
      return;
    }

    const existingAwards = await db.awards.byDivisionId(req.divisionId).getAll();
    for (const award of existingAwards) {
      if (award.winner_id || award.winner_name) {
        res.status(400).json({ error: 'One or more awards have been assigned' });
        return;
      }
    }

    await db.awards.byDivisionId(req.divisionId).deleteAll();

    for (const awardData of awards) {
      await db.awards.create({
        division_id: req.divisionId,
        name: awardData.name,
        index: awardData.index,
        place: awardData.place,
        type: awardData.type,
        is_optional: awardData.isOptional,
        allow_nominations: awardData.allowNominations,
        winner_id: null,
        winner_name: null
      });
    }

    res.status(201).end();
  }
);

router.delete(
  '/',
  requirePermission('MANAGE_EVENT_DETAILS'),
  async (req: AdminDivisionRequest, res) => {
    await db.awards.byDivisionId(req.divisionId).deleteAll();
    res.status(200).end();
  }
);

export default router;
