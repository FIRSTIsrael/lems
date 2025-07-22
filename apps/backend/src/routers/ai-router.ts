import { Router } from 'express';
import { enhanceFeedback } from '../lib/ai/agents/feedback/agent';
import asyncHandler from 'express-async-handler';
import { getRubric } from '@lems/database';
import { ObjectId } from 'mongodb';

const router = Router();

router.post(
  '/enhance-feedback',
  asyncHandler(async (req, res) => {
    const rubric = await getRubric({ _id: new ObjectId('679a55f199042139ba459aa0') });
    if (!rubric) {
      res.status(404).json({ error: 'Rubric not found' });
      return;
    }
    console.log('Enhancing feedback for rubric:', rubric.teamId, rubric.category);

    try {
      const { category, data } = rubric;
      const { values, feedback, awards } = data;
      const agentInput = {
        category,
        values,
        feedback,
        awards
      };
      const result = await enhanceFeedback(agentInput);
      res.status(200).json({
        message: 'Feedback enhancement process started successfully',
        original: rubric.data?.feedback,
        updated: result.feedback
      });
    } catch (error) {
      console.error('Error enhancing feedback:', error);
      res.status(500).json({
        error: 'Failed to enhance feedback',
        details: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  })
);

export default router;
