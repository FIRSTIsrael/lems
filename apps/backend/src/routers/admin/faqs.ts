import express from 'express';
import fileUpload from 'express-fileupload';
import { CreateFaqRequestSchema, UpdateFaqRequestSchema } from '@lems/types/api/admin';
import { Faq } from '@lems/database';
import db from '../../lib/database';
import { uploadFile } from '../../lib/blob-storage/upload';
import { AdminRequest } from '../../types/express';
import { requirePermission } from './middleware/require-permission';

const router = express.Router();

const IMAGE_SIZE_LIMIT = 2 * 1024 * 1024; // 2 MB
const VIDEO_SIZE_LIMIT = 50 * 1024 * 1024; // 50 MB

//to handle errors consistently
const handleError = (res: express.Response, error: unknown, context: string) => {
  console.error(`Error ${context}:`, error);
  res.status(500).json({ error: 'Internal server error' });
};

//to format FAQ response
const formatFaqResponse = (faq: Faq) => ({
  id: faq._id?.toString() || '',
  seasonId: faq.seasonId,
  question: faq.question,
  answer: faq.answer,
  displayOrder: faq.displayOrder,
  createdBy: {
    id: faq.createdBy.id,
    name: `${faq.createdBy.firstName} ${faq.createdBy.lastName}`
  },
  createdAt: faq.createdAt.toISOString(),
  updatedAt: faq.updatedAt.toISOString()
});

router.get('/', requirePermission('MANAGE_FAQ'), async (req: AdminRequest, res) => {
  try {
    const faqs = await db.faqs.all().getAll();
    res.json(faqs.map(formatFaqResponse));
  } catch (error) {
    handleError(res, error, 'fetching FAQs');
  }
});

router.get('/season/:seasonId', requirePermission('MANAGE_FAQ'), async (req: AdminRequest, res) => {
  try {
    const { seasonId } = req.params;
    const faqs = await db.faqs.bySeason(seasonId).getAll();
    res.json(faqs.map(formatFaqResponse));
  } catch (error) {
    handleError(res, error, 'fetching FAQs by season');
  }
});

router.get('/:id', requirePermission('MANAGE_FAQ'), async (req: AdminRequest, res) => {
  try {
    const { id } = req.params;
    const faq = await db.faqs.byId(id).get();
    
    if (!faq) {
      res.status(404).json({ error: 'FAQ not found' });
      return;
    }
    
    res.json(formatFaqResponse(faq));
  } catch (error) {
    handleError(res, error, 'fetching FAQ');
  }
});

router.post('/', requirePermission('MANAGE_FAQ'), async (req: AdminRequest, res) => {
  try {
    const validation = CreateFaqRequestSchema.safeParse(req.body);
    
    if (!validation.success) {
      res.status(400).json({ error: 'Invalid request data', details: validation.error.issues });
      return;
    }
    
    const { seasonId, question, answer, displayOrder } = validation.data;
    
    const order = displayOrder ?? (await db.faqs.getMaxDisplayOrder(seasonId)) + 1;
    
    // Get admin info for creator
    const admin = await db.admins.byId(req.userId).get();
    if (!admin) {
      res.status(401).json({ error: 'Admin not found' });
      return;
    }
    
    const faq = await db.faqs.create({
      seasonId,
      question,
      answer,
      displayOrder: order,
      createdBy: {
        id: req.userId,
        firstName: admin.first_name,
        lastName: admin.last_name
      }
    });
    
    res.status(201).json(formatFaqResponse(faq));
  } catch (error) {
    handleError(res, error, 'creating FAQ');
  }
});

router.put('/:id', requirePermission('MANAGE_FAQ'), async (req: AdminRequest, res) => {
  try {
    const { id } = req.params;
    const validation = UpdateFaqRequestSchema.safeParse(req.body);
    
    if (!validation.success) {
      res.status(400).json({ error: 'Invalid request data', details: validation.error.issues });
      return;
    }
    
    const existingFaq = await db.faqs.byId(id).get();
    if (!existingFaq) {
      res.status(404).json({ error: 'FAQ not found' });
      return;
    }
    
    const updates: { question?: string; answer?: string; displayOrder?: number } = {};
    if (validation.data.question !== undefined) updates.question = validation.data.question;
    if (validation.data.answer !== undefined) updates.answer = validation.data.answer;
    if (validation.data.displayOrder !== undefined) updates.displayOrder = validation.data.displayOrder;
    
    const updatedFaq = await db.faqs.byId(id).update(updates);
    res.json(formatFaqResponse(updatedFaq));
  } catch (error) {
    handleError(res, error, 'updating FAQ');
  }
});

router.delete('/:id', requirePermission('MANAGE_FAQ'), async (req: AdminRequest, res) => {
  try {
    const { id } = req.params;
    
    const existingFaq = await db.faqs.byId(id).get();
    if (!existingFaq) {
      res.status(404).json({ error: 'FAQ not found' });
      return;
    }
    
    await db.faqs.byId(id).delete();
    res.status(204).send();
  } catch (error) {
    handleError(res, error, 'deleting FAQ');
  }
});

router.post(
  '/upload-image',
  requirePermission('MANAGE_FAQ'),
  fileUpload(),
  async (req: AdminRequest, res) => {
    if (!req.files || !req.files.image) {
      res.status(400).json({ error: 'No image file provided' });
      return;
    }

    const imageFile = req.files.image as fileUpload.UploadedFile;

    if (
      !imageFile.mimetype?.startsWith('image/') ||
      (!imageFile.name.endsWith('.jpg') &&
        !imageFile.name.endsWith('.jpeg') &&
        !imageFile.name.endsWith('.png'))
    ) {
      res.status(400).json({ error: 'Image must be a JPG or PNG file' });
      return;
    }

    if (imageFile.size > IMAGE_SIZE_LIMIT) {
      res.status(400).json({ error: 'Image file size must not exceed 2 MB' });
      return;
    }

    try {
      const timestamp = Date.now();
      const extension = imageFile.name.split('.').pop();
      const filename = `faq-${timestamp}.${extension}`;
      const key = `faqs/${filename}`;

      const imageUrl = await uploadFile(imageFile.data, key);

      res.status(200).json({ url: imageUrl });
    } catch (error) {
      console.error('Error uploading FAQ image:', error);
      res.status(500).json({ error: 'Failed to upload image' });
    }
  }
);

router.post(
  '/upload-video',
  requirePermission('MANAGE_FAQ'),
  fileUpload(),
  async (req: AdminRequest, res) => {
    if (!req.files || !req.files.video) {
      res.status(400).json({ error: 'No video file provided' });
      return;
    }

    const videoFile = req.files.video as fileUpload.UploadedFile;

    if (
      !videoFile.mimetype?.startsWith('video/') ||
      (!videoFile.name.endsWith('.mp4') && !videoFile.name.endsWith('.webm'))
    ) {
      res.status(400).json({ error: 'Video must be an MP4 or WebM file' });
      return;
    }

    if (videoFile.size > VIDEO_SIZE_LIMIT) {
      res.status(400).json({ error: 'Video file size must not exceed 50 MB' });
      return;
    }

    try {
      const timestamp = Date.now();
      const extension = videoFile.name.split('.').pop();
      const filename = `faq-video-${timestamp}.${extension}`;
      const key = `faqs/${filename}`;

      const videoUrl = await uploadFile(videoFile.data, key);

      res.status(200).json({ url: videoUrl });
    } catch (error) {
      console.error('Error uploading FAQ video:', error);
      res.status(500).json({ error: 'Failed to upload video' });
    }
  }
);

export default router;
