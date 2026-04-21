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

interface TeamBatchInfo {
  teams: Array<{
    teamSlug: string;
    teamFolderPath: string;
    divisionId: string;
    eventSlug: string;
  }>;
}

const generateSinglePdf = async (
  teamSlug: string,
  pdfType: 'rubrics' | 'scoresheets',
  eventSlug: string,
  language: string,
  divisionId: string
): Promise<Buffer | null> => {
  try {
    console.info(`Generating ${pdfType} PDF for ${teamSlug}...`);
    const buffer = await getLemsWebpageAsPdf(
      `/${language}/lems/export/${teamSlug}/${eventSlug}/${pdfType}`,
      {
        teamSlug,
        divsionId: divisionId
      }
    );
    console.info(`✓ Generated ${pdfType} PDF for ${teamSlug}`);
    return buffer;
  } catch (error) {
    console.warn(
      `Failed to generate ${pdfType} PDF for ${teamSlug} (event: ${eventSlug}): ${error instanceof Error ? error.message : String(error)}`
    );
    return null;
  }
};

/**
 * Processes teams in batches and yields batch info with PDF tasks.
 * Batches teams to process them sequentially, reducing memory usage.
 */
async function* getTeamResults(
  eventId: string,
  eventName: string,
  eventSlug: string,
  batchSize: number = 10
): AsyncGenerator<TeamBatchInfo> {
  const divisions = await db.divisions.byEventId(eventId).getAll();
  if (divisions.length === 0) {
    throw new Error('No divisions found for event');
  }

  const folderName = `${eventName} Results`;
  let currentBatch: TeamBatchInfo['teams'] = [];
  let teamCount = 0;

  for (const division of divisions) {
    const teams = await db.teams.byDivisionId(division.id).getAll();

    for (const team of teams) {
      teamCount++;
      const teamSlug = `${team.region.toUpperCase()}-${team.number}`;
      const teamFolderPath = `${folderName}/${teamSlug}`;

      currentBatch.push({ teamSlug, teamFolderPath, divisionId: division.id, eventSlug });

      if (currentBatch.length === batchSize) {
        yield { teams: currentBatch };
        currentBatch = [];
      }
    }
  }

  if (teamCount === 0) {
    throw new Error('No teams found for event - cannot generate results');
  }

  // Yield remaining batch
  if (currentBatch.length > 0) {
    yield { teams: currentBatch };
  }
}

/**
 * Processes PDF batches sequentially.
 * @returns statistics about the generation process.
 */
async function getZippedResults(
  eventId: string,
  eventName: string,
  eventSlug: string,
  archive: archiver.Archiver,
  language: string,
  batchSize: number = 10
): Promise<{
  totalTeams: number;
  teamsWithPdfs: number;
  failedPdfs: number;
}> {
  const teamsWithResults = new Set<string>();
  let totalTeams = 0;
  let failedPdfs = 0;
  let batchNumber = 0;

  for await (const batch of getTeamResults(eventId, eventName, eventSlug, batchSize)) {
    batchNumber++;
    totalTeams += batch.teams.length;

    console.info(`Processing batch ${batchNumber} (${batch.teams.length} teams)...`);

    for (const team of batch.teams) {
      const rubricsBuffer = await generateSinglePdf(
        team.teamSlug,
        'rubrics',
        team.eventSlug,
        language,
        team.divisionId
      );

      if (rubricsBuffer) {
        archive.append(rubricsBuffer, {
          name: `${team.teamFolderPath}/rubrics.pdf`
        });
        teamsWithResults.add(team.teamSlug);
      } else {
        failedPdfs++;
      }

      const scoresheetBuffer = await generateSinglePdf(
        team.teamSlug,
        'scoresheets',
        team.eventSlug,
        language,
        team.divisionId
      );

      if (scoresheetBuffer) {
        archive.append(scoresheetBuffer, {
          name: `${team.teamFolderPath}/scoresheets.pdf`
        });
        teamsWithResults.add(team.teamSlug);
      } else {
        failedPdfs++;
      }
    }

    console.info(
      `Batch ${batchNumber} complete: ${batch.teams.length} teams processed, ` +
        `${failedPdfs} cumulative failed PDFs`
    );
  }

  const teamsWithPdfs = teamsWithResults.size;

  const successCount = (totalTeams * 2 - failedPdfs) / 2; // Each team has 2 PDFs
  console.info(
    `PDF Generation Complete: ${successCount}/${totalTeams} teams with PDFs, ${failedPdfs} total PDF tasks failed`
  );

  if (teamsWithPdfs === 0) {
    console.error(
      `ERROR: No PDFs were successfully generated for event '${eventName}'. This will result in an empty ZIP file. ` +
        `Check that the export page is working and LEMS_DOMAIN environment variable is set correctly.`
    );
  }

  return {
    totalTeams,
    teamsWithPdfs,
    failedPdfs
  };
}

/**
 * Generates a ZIP file with rubrics and scoresheets for all teams in an event.
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

  const statistics = await getZippedResults(
    eventId,
    event.name,
    event.slug,
    archive,
    language,
    5 // Process 5 teams at a time
  );

  return {
    archive,
    fileName: `${event.name.replace(/\s+/g, '_')}-results-${Date.now()}.zip`,
    statistics
  };
}
