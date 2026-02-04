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
    columns: false,
    skip_empty_lines: true
  }) as string[][];

  const teamNumbers = records
    .map(row => {
      const number = parseInt(row[0]?.trim(), 10);
      return isNaN(number) ? null : number;
    })
    .filter((num): num is number => num !== null);

  if (teamNumbers.length === 0) {
    throw new Error('No valid team numbers found in CSV');
  }

  const registered: Array<{
    name: string;
    number: number;
    division: { name: string; color: string };
  }> = [];
  const skipped: Array<{ name: string; number: number; reason: string }> = [];
  const allTeams = await db.teams.getAll();
  const teamsByNumber = new Map(allTeams.map(t => [t.number, t]));

  for (let i = 0; i < teamNumbers.length; i++) {
    const teamNumber = teamNumbers[i];
    const team = teamsByNumber.get(teamNumber);

    if (!team) {
      skipped.push({
        name: `Unknown`,
        number: teamNumber,
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
        reason: 'registration-failed'
      });
    }
  }

  return { registered, skipped };
};
