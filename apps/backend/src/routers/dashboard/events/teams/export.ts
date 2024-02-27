import { ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';
import express, { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import puppeteer from 'puppeteer';
import * as db from '@lems/database';

const router = express.Router({ mergeParams: true });

router.get(
  '/rubrics',
  asyncHandler(async (req: Request, res: Response) => {
    const team = await db.getTeam({
      eventId: new ObjectId(req.event._id),
      number: Number(req.teamNumber)
    });
    if (!team) {
      res.status(400).json({ error: 'BAD_REQUEST' });
      return;
    }

    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    const user = await db.getUser({ username: 'admin' });
    const jwtSecret = process.env.JWT_SECRET;
    const token = jwt.sign(
      {
        userId: user._id
      },
      jwtSecret,
      {
        issuer: 'FIRST',
        expiresIn: 60
      }
    );

    // Debug this while it's live.
    // If it doesn't work, domain needs to be dynamic
    await page.setCookie({
      domain: 'localhost',
      path: '/',
      name: 'auth-token',
      value: token,
      secure: true,
      httpOnly: true
    });

    await page.goto(
      `${process.env.FRONTEND_LOCAL_BASE_URL}/event/${team.eventId}/export/${team._id}/rubrics`,
      { waitUntil: ['load', 'domcontentloaded', 'networkidle0'] }
    );
    await page.pdf({
      path: `rubrics-team-${team.number}.pdf`,
      format: 'A4',
      margin: { top: '0.18in', bottom: '0.18in', right: '0.18in', left: '0.18in' },
      printBackground: true
    });
    // await browser.close();

    //  This will save a PDF in your local folder.
    //  If this works - I will return it in the response as a file

    res.status(200).json({ ok: true });
  })
);

router.get(
  '/scoresheets',
  asyncHandler(async (req: Request, res: Response) => {
    res.status(501).json({ error: 'NOT IMPLEMENTED' });
  })
);

router.get(
  '/awards',
  asyncHandler(async (req: Request, res: Response) => {
    res.status(501).json({ error: 'NOT IMPLEMENTED' });
  })
);

export default router;
