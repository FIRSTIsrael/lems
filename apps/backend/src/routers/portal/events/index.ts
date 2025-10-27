import express, { Request, Response } from 'express';
import { EventDetails, EventSummary } from '@lems/database';
import db from '../../../lib/database';
import { makePortalEventDetailsResponse, makePortalEventSummaryResponse, makePortalTeamInEventResponse } from './util';

const router = express.Router({ mergeParams: true });

router.get('/', async (req: Request, res: Response) => {
  const { after, season: seasonSlug, event: eventSlug } = req.query;

  if (eventSlug && typeof eventSlug === 'string') {
    const event = await db.events.bySlug(eventSlug).get();

    if (!event) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }

    const registeredTeams = await db.events.bySlug(eventSlug).getRegisteredTeams();
    const divisions = await db.divisions.byEventId(event.id).getAll();

    const eventSummary: EventSummary = {
      ...event,
      divisions,
      date: event.start_date.toISOString(),
      location: event.location,
      season_id: event.season_id,
      team_count: registeredTeams.length,
      is_fully_set_up: false,
      assigned_admin_ids: []
    };

    res.json([makePortalEventSummaryResponse(eventSummary)]);
    return;
  }

  if (seasonSlug && typeof seasonSlug === 'string') {
    const season = await db.seasons.bySlug(seasonSlug).get();

    if (!season) {
      res.status(400).json({ error: 'Invalid season slug' });
      return;
    }

    const events = await db.events.bySeason(season.id).getAllSummaries();
    res.json(events.map(makePortalEventSummaryResponse));
    return;
  }

  if (after && typeof after === 'string') {
    const timestamp = parseInt(after, 10);

    if (isNaN(timestamp)) {
      res.status(400).json({ error: 'Invalid timestamp for "after" parameter' });
      return;
    }

    const events = await db.events.after(timestamp).getAllSummaries();
    res.json(events.map(makePortalEventSummaryResponse));
    return;
  }

  const allEvents = await db.events.getAll();

  const events: EventSummary[] = await Promise.all(
    allEvents.map(async event => {
      const registeredTeams = await db.events.byId(event.id).getRegisteredTeams();
      const divisions = await db.divisions.byEventId(event.id).getAll();

      return {
        ...event,
        divisions,
        date: event.start_date.toISOString(),
        team_count: registeredTeams.length,
        is_fully_set_up: false,
        assigned_admin_ids: []
      };
    })
  );

  res.json(events.map(makePortalEventSummaryResponse));
  return;
});

router.get('/:slug', async (req: Request, res: Response) => {
  const { slug } = req.params;

  const event = await db.events.bySlug(slug).get();

  if (!event) {
    res.status(404).json({ error: 'Event not found' });
    return;
  }

  const divisions = await db.divisions.byEventId(event.id).getAllSummaries();
  const season = await db.seasons.byId(event.season_id).get();

  const eventSummary: EventDetails = {
    ...event,
    divisions,
    season_name: season.name,
    season_slug: season.slug
  };

  res.json(makePortalEventDetailsResponse(eventSummary));
});

router.get('/:slug/teams/:number', async (req: Request, res: Response) => {
  const { slug, number } = req.params;
  const teamNumber = parseInt(number, 10);

  if (isNaN(teamNumber)) {
    res.status(400).json({ error: 'Invalid team number' });
    return;
  }

  const event = await db.events.bySlug(slug).get();
  if (!event) {
    res.status(404).json({ error: 'Event not found' });
    return;
  }

  const team = await db.teams.byNumber(teamNumber).get();
  if (!team) {
    res.status(404).json({ error: 'Team not found' });
    return;
  }

  const registeredTeams = await db.events.bySlug(slug).getRegisteredTeams();
  const teamInEvent = registeredTeams.find(t => t.id === team.id);
  
  if (!teamInEvent) {
    res.status(404).json({ error: 'Team not registered for this event' });
    return;
  }

  const division = await db.divisions.byId(teamInEvent.division_id).get();
  if (!division) {
    res.status(404).json({ error: 'Division not found' });
    return;
  }

  const [awards, fieldSchedule, judgingSchedule, rooms, tables] = await Promise.all([
    db.awards.byDivisionId(division.id).getAll(),
    db.robotGameMatches.byDivisionId(division.id).getAll(),
    db.judgingSessions.byDivisionId(division.id).getAll(),
    db.rooms.byDivisionId(division.id).getAll(),
    db.tables.byDivisionId(division.id).getAll()
  ]);

  const teamAwards = awards.filter(award => 
    award.winner_id === team.id || award.winner_name === team.name
  );
  
  const teamMatches = fieldSchedule.filter(match =>
    match.participants.some(p => p.team_id === team.id)
  );
  
  const teamJudgingSessions = judgingSchedule.filter(session => 
    session.team_id === team.id
  );

  // TODO: Implement proper scoreboard queries when database has match results
  const teamScoreboard = null;

  const teamInEventData = makePortalTeamInEventResponse({
    team,
    division,
    teamAwards,
    teamMatches,
    teamJudgingSessions,
    rooms,
    tables,
    teamScoreboard,
    eventName: event.name,
    eventSlug: event.slug
  });

  res.json(teamInEventData);
});

export default router;
