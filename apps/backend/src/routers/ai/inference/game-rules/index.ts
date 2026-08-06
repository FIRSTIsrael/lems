import express from 'express';

const router = express.Router({ mergeParams: true });

router.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the AI Inference API!',
    routes: {
      '/game-rules': 'Access game rules inference endpoints',
      '/inference': 'Access general inference endpoints'
    }
  });
});

export default router;
