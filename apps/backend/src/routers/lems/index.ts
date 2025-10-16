import express from 'express';
import authRouter from './auth';
import gqlRouter from './gql';

const router = express.Router({ mergeParams: true });

router.use('/auth', authRouter);
router.use('/gql', gqlRouter);

export default router;
