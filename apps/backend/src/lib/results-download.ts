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

interface PdfTask {
  teamSlug: string;
  teamFolderPath: string;
  pdfType: 'rubrics' | 'scoresheets';
  promise: Promise<Buffer | null>;
  success: boolean;
}

const createPdfTask = (
  teamSlug: string,
  teamFolderPath: string,
  pdfType: 'rubrics' | 'scoresheets',
  eventSlug: string,
  language: string,
  divisionId: string
): PdfTask => {
  const pdfPath = pdfType === 'rubrics' ? 'rubrics' : 'scoresheets';

  return {
    teamSlug,
    teamFolderPath,
    pdfType,
    success: false,
    promise: getLemsWebpageAsPdf(`/${language}/lems/export/${teamSlug}/${eventSlug}/${pdfPath}`, {
      teamSlug,
      divsionId: divisionId
    }).catch(error => {
      console.warn(
        `Failed to generate ${pdfType} PDF for ${teamSlug} (event: ${eventSlug}): ${error instanceof Error ? error.message : String(error)}`
      );
      return null;
    })
  };
};

const collectPdfTasks = async (
  eventId: string,
  eventName: string,
  eventSlug: string,
  language: string
): Promise<{ tasks: PdfTask[]; totalTeams: number }> => {
  const divisions = await db.divisions.byEventId(eventId).getAll();
  if (divisions.length === 0) {
    throw new Error('No divisions found for event');
  }

  const folderName = `${eventName} Results`;
  const tasks: PdfTask[] = [];
  let totalTeams = 0;

  // Prepare all PDF generation tasks (runs in parallel)
  for (const division of divisions) {
    const teams = await db.teams.byDivisionId(division.id).getAll();
    totalTeams += teams.length;

    for (const team of teams) {
      const teamSlug = `${team.region.toUpperCase()}-${team.number}`;
      const teamFolderPath = `${folderName}/${teamSlug}`;

      // Queue rubrics PDF generation
      tasks.push(
        createPdfTask(teamSlug, teamFolderPath, 'rubrics', eventSlug, language, division.id)
      );

      // Queue scoresheets PDF generation
      tasks.push(
        createPdfTask(teamSlug, teamFolderPath, 'scoresheets', eventSlug, language, division.id)
      );
    }
  }

  if (totalTeams === 0) {
    throw new Error('No teams found for event - cannot generate results');
  }

  return { tasks, totalTeams };
};

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

  const archive = archiver('zip', {
    zlib: { level: 9 } // Maximum compression
  });

  const { tasks: pdfTasks, totalTeams } = await collectPdfTasks(
    eventId,
    event.name,
    event.slug,
    language
  );

  // Wait for all PDFs to generate in parallel
  const pdfResults = await Promise.all(pdfTasks.map(task => task.promise));

  const failedPdfs = pdfResults.filter(result => result === null).length;

  // Group PDFs by team and add to archive
  const teamsWithResults = new Set<string>();

  for (let i = 0; i < pdfTasks.length; i++) {
    const task = pdfTasks[i];
    const pdfBuffer = pdfResults[i];

    if (pdfBuffer) {
      const fileName = task.pdfType === 'rubrics' ? 'rubrics.pdf' : 'scoresheets.pdf';
      archive.append(pdfBuffer, {
        name: `${task.teamFolderPath}/${fileName}`
      });
      teamsWithResults.add(task.teamSlug);
    }
  }

  const teamsWithPdfs = teamsWithResults.size;

  // Log detailed statistics for diagnostics
  const successCount = (pdfTasks.length - failedPdfs) / 2; // Each team has 2 PDFs
  console.info(
    `PDF Generation Summary: ${successCount}/${totalTeams} teams with PDFs, ${failedPdfs}/${pdfTasks.length} PDF tasks failed`
  );

  if (teamsWithPdfs === 0) {
    console.error(
      `ERROR: No PDFs were successfully generated for event '${event.name}'. This will result in an empty ZIP file. ` +
        `Check that the export page is working and LEMS_DOMAIN environment variable is set correctly.`
    );
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
