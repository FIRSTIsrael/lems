import express from 'express';
import { CreateFaqRequestSchema, UpdateFaqRequestSchema } from '@lems/types/api/admin';
import { Faq } from '@lems/database';
import db from '../../lib/database';
import { AdminRequest } from '../../types/express';
import { requirePermission } from './middleware/require-permission';

const router = express.Router();

// Helper function to format FAQ response
const formatFaqResponse = (faq: Faq) => ({
  id: faq.id,
  seasonId: faq.season_id,
  question: faq.question,
  answer: faq.answer,
  displayOrder: faq.display_order,
  createdAt: faq.created_at.toISOString(),
  updatedAt: faq.updated_at.toISOString()
});

// GET /admin/faqs - Get all FAQs
router.get('/', requirePermission('MANAGE_FAQ'), async (req: AdminRequest, res) => {
  try {
    const faqs = await db.faqs.all().getAll();
    res.json(faqs.map(formatFaqResponse));
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /admin/faqs/season/:seasonId - Get FAQs by season
router.get('/season/:seasonId', requirePermission('MANAGE_FAQ'), async (req: AdminRequest, res) => {
  try {
    const { seasonId } = req.params;
    const faqs = await db.faqs.bySeason(seasonId).getAll();
    res.json(faqs.map(formatFaqResponse));
  } catch (error) {
    console.error('Error fetching FAQs by season:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /admin/faqs/:id - Get single FAQ
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
    console.error('Error fetching FAQ:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /admin/faqs - Create new FAQ
router.post('/', requirePermission('MANAGE_FAQ'), async (req: AdminRequest, res) => {
  try {
    const validation = CreateFaqRequestSchema.safeParse(req.body);
    
    if (!validation.success) {
      res.status(400).json({ error: 'Invalid request data', details: validation.error.issues });
      return;
    }
    
    const { seasonId, question, answer, displayOrder } = validation.data;
    
    // If no display order provided, get the next available order
    const order = displayOrder ?? (await db.faqs.getMaxDisplayOrder(seasonId)) + 1;
    
    const faq = await db.faqs.create({
      season_id: seasonId,
      question,
      answer,
      display_order: order
    });
    
    res.status(201).json(formatFaqResponse(faq));
  } catch (error) {
    console.error('Error creating FAQ:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /admin/faqs/:id - Update FAQ
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
    
    const updates: Partial<{ question: string; answer: string; display_order: number }> = {};
    if (validation.data.question !== undefined) updates.question = validation.data.question;
    if (validation.data.answer !== undefined) updates.answer = validation.data.answer;
    if (validation.data.displayOrder !== undefined) updates.display_order = validation.data.displayOrder;
    
    const updatedFaq = await db.faqs.byId(id).update(updates);
    res.json(formatFaqResponse(updatedFaq));
  } catch (error) {
    console.error('Error updating FAQ:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /admin/faqs/:id - Delete FAQ
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
    console.error('Error deleting FAQ:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
