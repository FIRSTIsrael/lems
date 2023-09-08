import express, { NextFunction, Request, Response } from 'express';
import loginPageRoute from './pages/login';

const router = express.Router({ mergeParams: true });

router.get('/pages/login', loginPageRoute);

export default router;
