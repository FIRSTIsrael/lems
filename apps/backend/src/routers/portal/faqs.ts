import express from 'express';
import { FaqWithCreator } from '@lems/database';
import db from '../../lib/database';

const router = express.Router();

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
    console.error('Error fetching FAQs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /portal/faqs/season/:seasonId - Get FAQs by season
router.get('/season/:seasonId', async (req, res) => {
  try {
    const { seasonId } = req.params;
    const faqs = await db.faqs.bySeason(seasonId).getAll();
    res.json(faqs.map(formatPortalFaqResponse));
  } catch (error) {
    console.error('Error fetching FAQs by season:', error);
    res.status(500).json({ error: 'Internal server error' });
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
    console.error('Error searching FAQs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
