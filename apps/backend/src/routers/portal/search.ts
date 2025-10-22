import express, { Request, Response } from 'express';
import db from '../../lib/database';

const router = express.Router({ mergeParams: true });

interface SearchQuery {
  q?: string;
  type?: 'teams' | 'events' | 'all';
  status?: 'active' | 'upcoming' | 'past' | 'all';
  limit?: string;
}

router.get('/', async (req: Request<object, object, object, SearchQuery>, res: Response) => {
  const { q, type = 'all', status = 'all', limit = '50' } = req.query;

  if (!q || q.trim().length < 2) {
    res.status(400).json({ error: 'Search query must be at least 2 characters long' });
    return;
  }

  const searchTerm = q.trim().toLowerCase();
  const resultLimit = Math.min(parseInt(limit, 10) || 50, 100); // Max 100? maybe less? maybe no max at all? idk
  const results = [];

  try {
    if (type === 'all' || type === 'teams') {
      const teamLimit = Math.floor(resultLimit / (type === 'all' ? 2 : 1));
      const matchingTeams = await db.teams.getSearchableTeams(searchTerm, teamLimit);

      const processedTeams = matchingTeams.map(team => ({
        type: 'team' as const,
        id: `team-${team.id}`,
        title: `${team.name} #${team.number}`,
        subtitle: [team.city, team.affiliation].filter(Boolean).join(' | '),
        description: team.affiliation || '',
        url: `/teams/${team.number}`,
        logoUrl: team.logo_url || undefined
      }));

      results.push(...processedTeams);
    }

    if (type === 'all' || type === 'events') {
      const eventLimit = Math.floor(resultLimit / (type === 'all' ? 2 : 1));
      const matchingEvents = await db.events.getSearchableEvents(searchTerm, status, eventLimit);

      const processedEvents = matchingEvents.map(event => ({
        type: 'event' as const,
        id: `event-${event.id}`,
        title: event.name,
        subtitle: event.location || '',
        description: `Event • ${event.status}`,
        url: `/events/${event.slug}`
      }));

      results.push(...processedEvents);
    }

    res.status(200).json({
      results,
      total: results.length,
      query: q,
      type,
      status
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Internal server error during search' });
  }
});

export default router;
