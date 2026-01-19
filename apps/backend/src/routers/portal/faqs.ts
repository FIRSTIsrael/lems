import express from 'express';
import { FaqWithCreator } from '@lems/database';
import db from '../../lib/database';

const router = express.Router();

// Helper function to handle errors consistently
const handleError = (res: express.Response, error: unknown, context: string) => {
  console.error(`Error ${context}:`, error);
  res.status(500).json({ error: 'Internal server error' });
};

// Format FAQ response for portal - excludes creator info, timestamps, and seasonId for public consumption
const formatPortalFaqResponse = (faq: FaqWithCreator) => ({
  id: faq.id,
  question: faq.question,
  answer: faq.answer,
  displayOrder: faq.display_order
});

// GET /portal/faqs - Get all FAQs
router.get('/', async (req, res) => {
  try {
    const faqs = await db.faqs.all().getAll();
    res.json(faqs.map(formatPortalFaqResponse));
  } catch (error) {
    handleError(res, error, 'fetching FAQs');
  }
});

// GET /portal/faqs/season/:seasonId - Get FAQs by season
router.get('/season/:seasonId', async (req, res) => {
  try {
    const { seasonId } = req.params;
    const faqs = await db.faqs.bySeason(seasonId).getAll();
    res.json(faqs.map(formatPortalFaqResponse));
  } catch (error) {
    handleError(res, error, 'fetching FAQs by season');
  }
});

// GET /portal/faqs/search - Search FAQs
router.get('/search', async (req, res) => {
  try {
    const { q, seasonId } = req.query;
    
    if (!q || typeof q !== 'string') {
      res.status(400).json({ error: 'Search query is required' });
      return;
    }
    
    let faqs: FaqWithCreator[];
    if (seasonId && typeof seasonId === 'string') {
      faqs = await db.faqs.bySeason(seasonId).search(q);
    } else {
      faqs = await db.faqs.all().search(q);
    }
    
    res.json(faqs.map(formatPortalFaqResponse));
  } catch (error) {
    handleError(res, error, 'searching FAQs');
  }
});

export default router;
