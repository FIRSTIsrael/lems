import express, { NextFunction, Request, Response } from 'express';

const router = express.Router({ mergeParams: true });

router.get('/', (req, res) => {
  res.send({ message: 'Welcome to backend!' });
});

export default router;
