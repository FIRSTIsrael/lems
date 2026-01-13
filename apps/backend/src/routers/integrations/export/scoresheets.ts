import { Router, Response } from 'express';
import { scoresheet } from '@lems/shared/scoresheet';
import db from '../../../lib/database';

const router = Router();

router.get('/', async (req, res: Response) => {
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

    const teamScoresheets = scoresheets.filter(s => s.teamId === team.id && s.stage === 'RANKING');

    if (teamScoresheets.length === 0) {
      return res.status(404).json({ error: 'No scores found for this team' });
    }

    // Get the first ranking scoresheet to extract mission details
    const rankingScoresheet = teamScoresheets.find(s => s.stage === 'RANKING');

    if (!rankingScoresheet || !rankingScoresheet.data?.missions) {
      return res.status(404).json({ error: 'No mission data found for this team' });
    }

    // Build detailed mission scores
    const missions = scoresheet.missions.map(mission => {
      const missionData = rankingScoresheet.data?.missions?.[mission.id] || {};
      const clauseValues = mission.clauses.map((_, index) => missionData[index] ?? null);

      let score = 0;
      try {
        score = mission.calculation(...clauseValues);
      } catch {
        score = 0;
      }

      return {
        id: mission.id,
        score
      };
    });

    const totalScore = rankingScoresheet.data?.score || 0;

    res.contentType('application/json');
    res.json({
      teamNumber: team.number,
      teamName: team.name,
      missions,
      totalScore
    });
  } catch (error) {
    console.error('Error exporting scores:', error);
    res.status(500).json({ error: 'Failed to export scores' });
  }
});

export default router;
