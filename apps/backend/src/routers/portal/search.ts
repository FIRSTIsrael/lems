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
      const teams = await db.teams.getAll();
      
      const matchingTeams = teams
        .filter(team => {
          const matchesName = team.name.toLowerCase().includes(searchTerm);
          const matchesNumber = team.number.toString().includes(searchTerm);
          const matchesAffiliation = team.affiliation?.toLowerCase().includes(searchTerm);
          const matchesCity = team.city?.toLowerCase().includes(searchTerm);
          
          return matchesName || matchesNumber || matchesAffiliation || matchesCity;
        })
        .slice(0, Math.floor(resultLimit / (type === 'all' ? 2 : 1)))
        .map(team => ({
          type: 'team' as const,
          id: `team-${team.id}`,
          title: `${team.name} #${team.number}`,
          subtitle: team.city || '',
          description: team.affiliation || '',
          url: `/teams/${team.number}`,
          logoUrl: team.logo_url || undefined
        }));

      results.push(...matchingTeams);
    }

    if (type === 'all' || type === 'events') {
      const events = await db.events.getAll();
      
      const matchingEvents = events
        .filter(event => {
          const matchesName = event.name.toLowerCase().includes(searchTerm);
          const matchesLocation = event.location?.toLowerCase().includes(searchTerm);
          const matchesSlug = event.slug.toLowerCase().includes(searchTerm);
          
          if (status !== 'all') {
            const now = new Date();
            const eventStatus = 
              event.start_date > now ? 'upcoming' :
              event.end_date < now ? 'past' : 'active';
            
            if (eventStatus !== status) return false;
          }
          
          return matchesName || matchesLocation || matchesSlug;
        })
        .slice(0, Math.floor(resultLimit / (type === 'all' ? 2 : 1)))
        .map(event => {
          const now = new Date();
          const eventStatus = 
            event.start_date > now ? 'upcoming' :
            event.end_date < now ? 'past' : 'active';
          
          return {
            type: 'event' as const,
            id: `event-${event.id}`,
            title: event.name,
            subtitle: event.location || '',
            description: `Event • ${eventStatus}`,
            url: `/events/${event.slug}`
          };
        });

      const resolvedEvents = await Promise.all(matchingEvents);
      results.push(...resolvedEvents);
    }

    const sortedResults = results.sort((a, b) => {
      const getRelevanceScore = (item: { type: string; title: string }) => {
        const title = item.title.toLowerCase();
        if (title === searchTerm) return 100;
        if (title.startsWith(searchTerm)) return 80;
        if (title.includes(searchTerm)) return 50;
        return 25;
      };
      
      return getRelevanceScore(b) - getRelevanceScore(a);
    });

    res.status(200).json({
      results: sortedResults,
      total: sortedResults.length,
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
