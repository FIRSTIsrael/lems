import { Router, Response } from 'express';
import { rubrics as rubricSchemas } from '@lems/shared/rubrics';
import db from '../../../lib/database';

const router = Router();

router.get('/rubrics', async (req, res: Response) => {
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

    const season = await db.seasons.byId(event.season_id).get();
    const seasonName = season?.name;

    const [, number] = teamId.split('-');
    const teams = await db.teams.getAll();
    const team = teams.find(t => t.number === parseInt(number));
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    const divisions = await db.divisions.byEventId(event.id).getAll();
    const rubrics = await Promise.all(
      divisions.map(div => db.rubrics.byDivision(div.id).getAll())
    ).then(results => results.flat());

    const teamRubrics = rubrics.filter(r => r.teamId === team.id);

    if (teamRubrics.length === 0) {
      return res.status(404).json({ error: 'No rubrics found for this team' });
    }

    const rubricsData = teamRubrics.map(rubric => {
      const division = divisions.find(d => d.id === rubric.divisionId);
      const rubricSchema = rubricSchemas[rubric.category as keyof typeof rubricSchemas];
      const scores: Record<string, number | null> = {};
      
      if (rubric.data?.fields) {
        Object.entries(rubric.data.fields).forEach(([fieldId, fieldData]) => {
          scores[fieldId] = fieldData.value || null;
        });
      }
      
      return {
        divisionName: division?.name || 'Unknown Division',
        teamNumber: team.number,
        teamName: team.name,
        rubricCategory: rubric.category,
        seasonName,
        eventName: event.name,
        scores,
        status: rubric.status,
        feedback: rubric.data?.feedback,
        schema: typeof rubricSchema === 'string' ? null : rubricSchema
      };
    });

    res.contentType('application/json');
    res.json({ rubrics: rubricsData });
  } catch (error) {
    console.error('Error exporting rubrics:', error);
    res.status(500).json({ error: 'Failed to export rubrics' });
  }
});

export default router;
