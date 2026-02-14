import { parse } from 'csv-parse/sync';
import { UploadedFile } from 'express-fileupload';
import { Division } from '@lems/database';
import db from '../../../../lib/database';

export function isTeamsRegistration(data: unknown): data is Record<string, string[]> {
  if (typeof data !== 'object' || data === null) return false;

  return Object.entries(data).every(
    ([key, value]) =>
      typeof key === 'string' &&
      Array.isArray(value) &&
      value.every(item => typeof item === 'string')
  );
}

export const parseTeamCSVRegistration = async (
  csv: UploadedFile,
  divisions: Division[],
  eventId: string,
  randomize: boolean
) => {
  const records = parse(csv.data, {
    columns: ['number', 'region'],
    skip_empty_lines: true
  }) as { number: string; region: string }[];

  const teamSlugs = records
    .map(row => {
      const number = parseInt(row.number, 10);
      console.warn('Parsed CSV row:', {
        number,
        region: row.region,
        slug: `${row.region}-${number}`
      });
      return isNaN(number) ? null : `${row.region}-${number}`;
    })
    .filter((slug): slug is string => slug !== null);

  if (teamSlugs.length === 0) {
    throw new Error('No valid team numbers found in CSV');
  }

  const registered: Array<{
    name: string;
    number: number;
    region: string;
    division: { name: string; color: string };
  }> = [];
  const skipped: Array<{ name: string; number: number; region: string; reason: string }> = [];
  const allTeams = await db.teams.getAll();
  const teamsBySlug = new Map(allTeams.map(t => [`${t.region}-${t.number}`, t]));

  for (let i = 0; i < teamSlugs.length; i++) {
    const teamSlug = teamSlugs[i];
    const team = teamsBySlug.get(teamSlug);

    if (!team) {
      const [region, numberStr] = teamSlug.split('-');
      const number = parseInt(numberStr, 10);
      skipped.push({
        name: `Unknown`,
        number,
        region,
        reason: 'team-not-found'
      });
      continue;
    }

    const registeredTeams = await db.events.byId(eventId).getRegisteredTeams();
    const alreadyRegistered = registeredTeams.find(rt => rt.id === team.id);

    if (alreadyRegistered) {
      skipped.push({
        name: team.name,
        number: team.number,
        region: team.region,
        reason: 'already-registered'
      });
      continue;
    }

    const assignedDivision = randomize ? divisions[i % divisions.length] : divisions[0];

    const registration: Record<string, string[]> = {
      [assignedDivision.id]: [team.id]
    };

    try {
      await db.events.byId(eventId).registerTeams(registration);
      registered.push({
        name: team.name,
        number: team.number,
        region: team.region,
        division: {
          name: assignedDivision.name,
          color: assignedDivision.color
        }
      });
    } catch (error) {
      console.error(`Error registering team ${team.number}:`, error);
      skipped.push({
        name: team.name,
        number: team.number,
        region: team.region,
        reason: 'registration-failed'
      });
    }
  }

  return { registered, skipped };
};
