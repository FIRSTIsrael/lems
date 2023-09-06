import express, { NextFunction, Request, Response } from 'express';

const router = express.Router({ mergeParams: true });

router.use(express.json());

router.get('/', (req, res) => {
  res.send({ message: 'Welcome to backend!' });
});

router.use((req, res) => res.status(404).json({ error: 'ROUTE_NOT_DEFINED' }));

router.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.log(err);
  return res.status(500).json({ error: 'INTERNAL_SERVER_ERROR' });
});

export default router;
