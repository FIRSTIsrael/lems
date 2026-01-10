import { Router, Response } from 'express';
import { Parser, FieldInfo } from '@json2csv/plainjs';
import db from '../../../lib/database';

const router = Router();

router.get('/scores', async (req, res: Response) => {
  try {
    const eventSlug = req.query.eventSlug as string;
    const teamId = req.query.teamId as string;

    if (!eventSlug || !teamId) {
      return res.status(400).json({ error: 'eventSlug and teamId are required' });
    }

    const event = await db.events.bySlug(eventSlug).get();
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const [, number] = teamId.split('-');
    const teams = await db.teams.getAll();
    const team = teams.find(t => t.number === parseInt(number));
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    const divisions = await db.divisions.byEventId(event.id).getAll();
    const scoresheets = await Promise.all(
      divisions.map(div => db.scoresheets.byDivision(div.id).getAll())
    ).then(results => results.flat());

    const teamScoresheets = scoresheets.filter(
      s => s.teamId === team.id && s.stage === 'RANKING'
    );

    if (teamScoresheets.length === 0) {
      return res.status(404).json({ error: 'No scores found for this team' });
    }

    const scores = Object.fromEntries(
      teamScoresheets.map(scoresheet => [`round-${scoresheet.round}`, scoresheet.data?.score || 0])
    );

    const csvData = [{
      teamNumber: team.number,
      teamName: team.name,
      ...scores
    }];

    res.set('Content-Disposition', `attachment; filename=scores-${teamId}.csv`);
    res.set('Content-Type', 'text/csv');

    const fields: Array<string | FieldInfo<object, unknown>> = [
      { label: 'Team Number', value: 'teamNumber' },
      { label: 'Team Name', value: 'teamName' }
    ];

    const roundNumbers = Object.keys(scores)
      .filter(key => key.startsWith('round-'))
      .map(key => parseInt(key.replace('round-', '')))
      .sort((a, b) => a - b);

    roundNumbers.forEach(round => {
      fields.push({
        label: `Round ${round}`,
        value: row => row[`round-${round}`]
      });
    });

    const parser = new Parser({ fields });
    res.send(`\ufeff${parser.parse(csvData)}`);
  } catch (error) {
    console.error('Error exporting scores:', error);
    res.status(500).json({ error: 'Failed to export scores' });
  }
});

export default router;
