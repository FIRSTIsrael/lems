import express from 'express';
import { createHandler } from 'graphql-http/lib/use/express';
import { schema } from '../../lib/graphql';

const router = express.Router({ mergeParams: true });

router.all('/', createHandler({ schema }));

export default router;
