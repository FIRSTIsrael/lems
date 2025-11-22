import express, { Request, Response } from 'express';
import dayjs from 'dayjs';
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
  const resultLimit = Math.min(Number.parseInt(limit) || 50, 100);
  const results = [];

  try {
    if (type === 'all' || type === 'teams') {
      const teamLimit = Math.floor(resultLimit / (type === 'all' ? 2 : 1));
      const matchingTeams = await db.teams.search(searchTerm, teamLimit);

      const processedTeams = matchingTeams.map(team => ({
        type: 'team' as const,
        id: `team-${team.id}`,
        slug: `${team.region}-${team.number}`,
        title: `${team.name} #${team.number}`,
        location: [team.city, team.affiliation].filter(Boolean).join(' , '),
        description: team.affiliation || '',
        logoUrl: team.logo_url || null,
        region: team.region
      }));

      results.push(...processedTeams);
    }

    if (type === 'all' || type === 'events') {
      const eventLimit = Math.floor(resultLimit / (type === 'all' ? 2 : 1));
      const matchingEvents = await db.events.search(searchTerm, status, eventLimit);

      const processedEvents = matchingEvents.map(event => {
        let eventStatus = status;
        if (status === 'all') {
          const today = dayjs().startOf('day');
          const eventDate = dayjs(event.start_date).startOf('day');
          eventStatus = eventDate.isAfter(today)
            ? 'upcoming'
            : eventDate.isBefore(today)
              ? 'past'
              : 'active';
        }

        return {
          type: 'event' as const,
          id: `event-${event.id}`,
          slug: event.slug,
          title: event.name,
          location: event.location || '',
          description: `Event • ${eventStatus}`,
          region: event.region
        };
      });

      results.push(...processedEvents);
    }

    res.status(200).json({ results, total: results.length });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Internal server error during search' });
  }
});

export default router;
