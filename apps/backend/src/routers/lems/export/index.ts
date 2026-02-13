import express, { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { extractToken } from '../../../lib/security/auth';
import db from '../../../lib/database';
import { ScoresheetClauseValue } from '@lems/shared/scoresheet';

const router = express.Router({ mergeParams: true });

const integrationsJwtSecret = process.env.INTEGRATIONS_LEMS_JWT as string;

// router.use('/:teamId/:eventSlug', async (req: Request, res: Response, next: NextFunction) => {
//   const { teamId, eventSlug } = req.params;
//   try {
//     const token = extractToken(req);
//     const tokenData = jwt.verify(token, integrationsJwtSecret) as {
//       teamId: string;
//       eventSlug: string;
//     };

//     // Validate team and event from token
//     const team = await db.teams.byId(tokenData.teamId).get();
//     if (!team) {
//       throw new Error('Team not found');
//     }
//     if (team.id !== teamId) {
//       throw new Error('Invalid team ID');
//     }

//     const event = await db.events.bySlug(eventSlug).get();
//     if (!event) {
//       throw new Error('Event not found');
//     }
//     if (event.slug !== eventSlug) {
//       throw new Error('Invalid event slug');
//     }

//     const teamDivision = await db.teams.byId(teamId).isInEvent(event.id);
//     if (!teamDivision) {
//       throw new Error('Team is not part of the event');
//     }

//     // Validate that the event is published
//     const eventSettings = await db.events.bySlug(eventSlug).getSettings();
//     if (!eventSettings) {
//       throw new Error('Event settings not found');
//     }
//     if (!eventSettings.published) {
//       throw new Error('Event not published');
//     }

//     next();
//   } catch {
//     // Invalid token
//   }

//   res.status(401).json({ error: 'UNAUTHORIZED' });
// });

router.get('/:teamSlug/:eventSlug/scoresheets', async (req: Request, res: Response) => {
  const { teamSlug, eventSlug } = req.params;

  const team = await db.teams.bySlug(teamSlug).get();
  const event = await db.events.bySlug(eventSlug).get();

  const divisionId = await db.teams.bySlug(teamSlug).isInEvent(event.id);
  const division = await db.divisions.byId(divisionId!).get();

  const season = await db.seasons.byId(event.season_id).get();

  const scoresheets = (
    await db.scoresheets.byDivision(division.id).byTeamId(team.id).getAll()
  ).filter(s => s.stage === 'RANKING');

  res.json({
    teamNumber: team.number,
    teamName: team.name,
    teamLogoUrl: team.logo_url,
    eventName: event.name,
    divisionName: division.name,
    seasonName: season.name,
    scoresheets: scoresheets.map(s => {
      // Transform missions object to use string keys for clause indices
      const missions = s.data.missions || {};
      const transformedMissions: { clauses: Array<{ value: ScoresheetClauseValue }> }[] = [];

      for (const clauses of Object.values(missions)) {
        const clausesObject: { clauses: Array<{ value: ScoresheetClauseValue }> } = { clauses: [] };
        for (const value of Object.values(clauses)) {
          clausesObject.clauses.push({ value });
        }
        transformedMissions.push(clausesObject);
      }

      return {
        round: s.round,
        missions: transformedMissions,
        score: s.data.score
      };
    })
  });
});

router.get('/:teamSlug/:eventSlug/rubrics', async (req: Request, res: Response) => {
  const { teamSlug, eventSlug } = req.params;

  const team = await db.teams.bySlug(teamSlug).get();
  const event = await db.events.bySlug(eventSlug).get();

  const divisionId = await db.teams.bySlug(teamSlug).isInEvent(event.id);
  const division = await db.divisions.byId(divisionId!).get();

  const season = await db.seasons.byId(event.season_id).get();

  const rubrics = await db.rubrics.byDivision(division.id).byTeamId(team.id).getAll();

  res.json({
    teamNumber: team.number,
    teamName: team.name,
    teamLogoUrl: team.logo_url,
    eventName: event.name,
    divisionName: division.name,
    seasonName: season.name,
    rubrics: rubrics.map(r => ({
      id: r._id,
      category: r.category,
      data: r.data
    }))
  });
});

export default router;
