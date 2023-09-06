import express, { NextFunction, Request, Response } from 'express';

const router = express.Router({ mergeParams: true });

router.post('/login', (req, res) => {
  res.send({ message: 'Login!' });
});

router.post('/logout', (req, res) => {
  res.send({ message: 'Logout!' });
});

export default router;
