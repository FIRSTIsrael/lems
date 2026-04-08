import archiver from 'archiver';
import { getLemsWebpageAsPdf } from '../routers/integrations/export';
import db from './database';

export interface DownloadResults {
  success: boolean;
  statistics: {
    totalTeams: number;
    teamsWithPdfs: number;
    failedPdfs: number;
  };
}

/**
 * Generates a ZIP file with rubrics and scoresheets for all teams in an event
 * Structure: <event-name> Results/<team-slug>/rubrics.pdf, scoresheets.pdf
 * PDFs that fail to generate are skipped silently, and empty team folders are not created
 */
export async function generateEventResultsZip(
  eventId: string,
  language: string = 'en'
): Promise<{
  archive: archiver.Archiver;
  fileName: string;
  statistics: { totalTeams: number; teamsWithPdfs: number; failedPdfs: number };
}> {
  const event = await db.events.byId(eventId).get();
  if (!event) {
    throw new Error('Event not found');
  }

  const divisions = await db.divisions.byEventId(eventId).getAll();
  if (divisions.length === 0) {
    throw new Error('No divisions found for event');
  }

  const archive = archiver('zip', {
    zlib: { level: 9 } // Maximum compression
  });

  let totalTeams = 0;
  let teamsWithPdfs = 0;
  let failedPdfs = 0;

  const folderName = `${event.name} Results`;

  // Process each division and its teams
  for (const division of divisions) {
    const teams = await db.teams.byDivisionId(division.id).getAll();
    totalTeams += teams.length;

    for (const team of teams) {
      const teamSlug = `${team.region.toUpperCase()}-${team.number}`;
      const teamFolderPath = `${folderName}/${teamSlug}`;

      let hasAnyPdf = false;

      try {
        const rubricsPdf = await getLemsWebpageAsPdf(
          `/${language}/lems/export/${teamSlug}/${event.slug}/rubrics`,
          {
            teamSlug,
            divsionId: division.id
          }
        );
        archive.append(rubricsPdf, {
          name: `${teamFolderPath}/rubrics.pdf`
        });
        hasAnyPdf = true;
      } catch (error) {
        console.warn(`Failed to generate rubrics PDF for ${teamSlug}:`, error);
        failedPdfs++;
      }

      try {
        const scoresheetPdf = await getLemsWebpageAsPdf(
          `/${language}/lems/export/${teamSlug}/${event.slug}/scoresheets`,
          {
            teamSlug,
            divsionId: division.id
          }
        );
        archive.append(scoresheetPdf, {
          name: `${teamFolderPath}/scoresheets.pdf`
        });
        hasAnyPdf = true;
      } catch (error) {
        console.warn(`Failed to generate scoresheets PDF for ${teamSlug}:`, error);
        failedPdfs++;
      }

      if (hasAnyPdf) {
        teamsWithPdfs++;
      }
    }
  }

  return {
    archive,
    fileName: `${event.name.replace(/\s+/g, '_')}-results-${Date.now()}.zip`,
    statistics: {
      totalTeams,
      teamsWithPdfs,
      failedPdfs
    }
  };
}
