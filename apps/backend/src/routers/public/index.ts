import express from 'express';
import eventsRouter from './events';
import puppeteer from 'puppeteer';

const router = express.Router({ mergeParams: true });

router.use('/events', eventsRouter);

router.get('/events2/:eventId/:teamId/rubrics', async (req, res) => {
  const { eventId, teamId } = req.params;
  if (!eventId || !teamId) return res.status(400).json(JSON.stringify({ message: 'bad request' }));

  const browser = await puppeteer.launch({ headless: false });

  const page = await browser.newPage();
  await page.goto(
    `http://localhost:4200/export/event/${req.params.eventId}/team/${req.params.teamId}/rubric`
  );

  await page.pdf({ path: `rubrics-event-${[eventId]}-team-${teamId}.pdf`, format: 'A4' });

  await browser.close();
});

export default router;
