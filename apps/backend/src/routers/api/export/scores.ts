import { Router, Response } from 'express';
import { scoresheet } from '@lems/shared/scoresheet';
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
    const allScoresheets = await Promise.all(
      divisions.map(div => db.scoresheets.byDivision(div.id).getAll())
    ).then(results => results.flat());

    const teamScoresheets = allScoresheets.filter(
      s => s.teamId === team.id && s.stage === 'RANKING'
    );

    if (teamScoresheets.length === 0) {
      return res.status(404).json({ error: 'No scores found for this team' });
    }

    teamScoresheets.sort((a, b) => a.round - b.round);

    const division = divisions.find(d => d.id === teamScoresheets[0].divisionId);
    if (!division) {
      return res.status(404).json({ error: 'Division not found' });
    }

    const season = await db.seasons.byId(event.season_id).get();
    const seasonName = season?.name || 'Unknown Season';

    const scoresheets = teamScoresheets.map(rankingScoresheet => {
      if (!rankingScoresheet.data?.missions) {
        return null;
      }

      const missions = scoresheet.missions.map(mission => {
        const missionData = rankingScoresheet.data?.missions?.[mission.id];
        
        if (!missionData) {
          return {
            clauses: mission.clauses.map(() => ({ value: null }))
          };
        }

        const clausesArray = mission.clauses.map((_, index) => ({
          value: missionData[index] ?? null
        }));

        return {
          clauses: clausesArray
        };
      });

      return {
        round: rankingScoresheet.round,
        missions,
        score: rankingScoresheet.data?.score || 0
      };
    }).filter(s => s !== null);

    res.contentType('application/json');
    res.json({
      teamNumber: team.number,
      teamName: team.name,
      eventName: event.name,
      divisionName: division.name,
      seasonName,
      scoresheets
    });
  } catch (error) {
    console.error('Error exporting scores:', error);
    res.status(500).json({ error: 'Failed to export scores' });
  }
});

export default router;
