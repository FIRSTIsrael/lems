import express from 'express';
import authRouter from './auth';
import graphqlRouter from './graphql';

const router = express.Router({ mergeParams: true });

router.use('/auth', authRouter);
router.use('/graphql', graphqlRouter);

export default router;
