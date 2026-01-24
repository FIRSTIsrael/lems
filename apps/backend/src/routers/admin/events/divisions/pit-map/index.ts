import express from 'express';
import fileUpload from 'express-fileupload';
import db from '../../../../../lib/database';
import { requirePermission } from '../../../middleware/require-permission';
import { AdminDivisionRequest } from '../../../../../types/express';

const router = express.Router({ mergeParams: true });

router.post(
  '/',
  requirePermission('MANAGE_EVENT_DETAILS'),
  fileUpload(),
  async (req: AdminDivisionRequest, res) => {
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
      const updatedDivision = await db.divisions.byId(req.divisionId).updatePitMap(pitMapFile.data);
      if (updatedDivision) {
        res.status(200).json(updatedDivision);
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
  }
);

router.delete(
  '/',
  requirePermission('MANAGE_EVENT_DETAILS'),
  async (req: AdminDivisionRequest, res) => {
    try {
      const success = await db.divisions.byId(req.divisionId).update({ pit_map_url: null });
      if (success) {
        res.status(200).json({ success: true });
        return;
      } else {
        res.status(500).json({ error: 'Failed to delete pit map' });
        return;
      }
    } catch (error) {
      console.error('Error deleting pit map:', error);
      res.status(500).json({ error: 'Failed to delete pit map' });
      return;
    }
  }
);

export default router;
