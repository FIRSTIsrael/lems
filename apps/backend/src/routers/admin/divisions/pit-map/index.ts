import express from 'express';
import fileUpload from 'express-fileupload';
import db from '../../../../lib/database';
import { requirePermission } from '../../../../middlewares/admin/require-permission';

const router = express.Router({ mergeParams: true });

router.post('/', requirePermission('MANAGE_EVENT_DETAILS'), fileUpload(), async (req, res) => {
  const { id } = req.params;
  let division = await db.divisions.byId(id).get();

  if (!division) {
    res.status(404).json({ error: 'Division not found' });
    return;
  }

  if (!req.files || !req.files.pitMap) {
    res.status(400).json({ error: 'No pit map file provided' });
    return;
  }

  const pitMapFile = req.files.pitMap as fileUpload.UploadedFile;

  if (
    !pitMapFile.mimetype?.startsWith('image/') ||
    (!pitMapFile.name.endsWith('.jpg') &&
      !pitMapFile.name.endsWith('.jpeg') &&
      !pitMapFile.name.endsWith('.png'))
  ) {
    res.status(400).json({ error: 'Pit map must be an image file (JPG, JPEG, or PNG)' });
    return;
  }

  try {
    const updatedDivision = await db.divisions.byId(division.id).updatePitMap(pitMapFile.data);
    if (updatedDivision) {
      division = updatedDivision;
      res.status(200).json(division);
      return;
    } else {
      res.status(500).json({ error: 'Failed to upload pit map' });
      return;
    }
  } catch (error) {
    console.error('Error uploading pit map:', error);
    res.status(500).json({ error: 'Failed to upload pit map' });
    return;
  }
});

export default router;
