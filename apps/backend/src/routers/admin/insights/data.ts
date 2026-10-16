import { Division, RubricStatus, JudgingCategory } from '@lems/database';
import { Edition, getEdition } from '@lems/shared/edition';
import { getScoresheet, ScoresheetClauseValue, ScoresheetSchema } from '@lems/shared/scoresheet';
import { getRubrics, inferCoreValuesFields, RubricsSchema } from '@lems/shared/rubrics';
import { InsightsStage, InsightsTeamRef } from '@lems/types/api/admin';
import db from '../../../lib/database';
import { mean } from './stats';

const FINAL_RUBRIC_STATUSES: RubricStatus[] = ['completed', 'locked', 'approved'];
const CACHE_TTL_MS = 60 * 1000;

export interface ScoresheetRecord {
  teamId: string;
  stage: InsightsStage;
  round: number;
  score: number;
  tableId: string | null;
  gp: number | null;
  /** Clause values per mission, ordered by clause index according to the scoresheet schema. */
  missions: Record<string, ScoresheetClauseValue[]>;
}

export interface RubricRecord {
  teamId: string;
  category: JudgingCategory;
  roomId: string | null;
  fields: Record<string, number>;
  average: number;
}

export interface MatchRecord {
  id: string;
  stage: InsightsStage;
  round: number;
  number: number;
  scheduledTime: Date;
  startTime: Date | null;
  completed: boolean;
  /** Seconds between scheduled and actual start, null if the match never started. */
  delay: number | null;
}

export interface SessionRecord {
  id: string;
  teamId: string | null;
  roomId: string;
  number: number;
  scheduledTime: Date;
  completed: boolean;
  delay: number | null;
}

export interface DivisionInsightsData {
  division: Division;
  edition: Edition;
  scoresheetSchema: ScoresheetSchema;
  rubricsSchema: RubricsSchema;
  teams: Map<string, InsightsTeamRef>;
  tables: Map<string, string>;
  rooms: Map<string, string>;
  matches: MatchRecord[];
  sessions: SessionRecord[];
  scoresheets: ScoresheetRecord[];
  scoresheetTotal: number;
  rubrics: RubricRecord[];
  rubricTotal: number;
  /** Optional award nominations from Core Values rubrics, keyed by team ID. */
  nominations: Map<string, string[]>;
}

const secondsBetween = (from: Date, to: Date) =>
  Math.round((new Date(to).getTime() - new Date(from).getTime()) / 1000);

const toNumericFields = (fields: Record<string, { value: number | null } | undefined> = {}) =>
  Object.fromEntries(
    Object.entries(fields)
      .filter(([, field]) => typeof field?.value === 'number')
      .map(([id, field]) => [id, field!.value as number])
  );

const loadDivisionInsightsData = async (division: Division): Promise<DivisionInsightsData> => {
  const divisionId = division.id;
  const edition = getEdition(division);
  const scoresheetSchema = getScoresheet(edition);
  const rubricsSchema = getRubrics(edition);

  const [teams, tables, rooms, matches, sessions, scoresheets, rubrics] = await Promise.all([
    db.teams.byDivisionId(divisionId).getAll(),
    db.tables.byDivisionId(divisionId).getAll(),
    db.rooms.byDivisionId(divisionId).getAll(),
    db.robotGameMatches.byDivision(divisionId).getAll(),
    db.judgingSessions.byDivision(divisionId).getAll(),
    db.scoresheets.byDivision(divisionId).getAll(),
    db.rubrics.byDivision(divisionId).getAll()
  ]);

  const teamMap = new Map<string, InsightsTeamRef>(
    teams.map(team => [
      team.id,
      { teamId: team.id, number: team.number, name: team.name, affiliation: team.affiliation }
    ])
  );

  // (teamId, stage, round) -> tableId
  const tableByMatchSlot = new Map<string, string>();
  const matchRecords: MatchRecord[] = [];
  for (const match of matches) {
    if (match.stage === 'TEST') continue;
    matchRecords.push({
      id: match.id,
      stage: match.stage,
      round: match.round,
      number: match.number,
      scheduledTime: match.scheduled_time,
      startTime: match.start_time,
      completed: match.status === 'completed',
      delay: match.start_time ? secondsBetween(match.scheduled_time, match.start_time) : null
    });
    for (const participant of match.participants) {
      if (!participant.team_id) continue;
      tableByMatchSlot.set(
        `${participant.team_id}:${match.stage}:${match.round}`,
        participant.table_id
      );
    }
  }

  const sessionRecords: SessionRecord[] = sessions.map(session => ({
    id: session.id,
    teamId: session.team_id,
    roomId: session.room_id,
    number: session.number,
    scheduledTime: session.scheduled_time,
    completed: session.status === 'completed',
    delay: session.start_time ? secondsBetween(session.scheduled_time, session.start_time) : null
  }));
  const roomByTeam = new Map(
    sessionRecords.filter(s => s.teamId).map(s => [s.teamId as string, s.roomId])
  );

  const scoresheetRecords: ScoresheetRecord[] = scoresheets
    .filter(s => s.status === 'submitted' && typeof s.data?.score === 'number')
    .filter(s => teamMap.has(s.teamId))
    .map(s => ({
      teamId: s.teamId,
      stage: s.stage,
      round: s.round,
      score: s.data!.score,
      tableId: tableByMatchSlot.get(`${s.teamId}:${s.stage}:${s.round}`) ?? null,
      gp: s.data?.gp?.value ?? null,
      missions: Object.fromEntries(
        scoresheetSchema.missions.map(mission => [
          mission.id,
          mission.clauses.map((_, index) => s.data?.missions?.[mission.id]?.[index] ?? null)
        ])
      )
    }));

  const finalRubrics = rubrics.filter(
    r => FINAL_RUBRIC_STATUSES.includes(r.status) && teamMap.has(r.teamId)
  );

  const rubricRecords: RubricRecord[] = [];
  const nominations = new Map<string, string[]>();
  const makeRecord = (
    teamId: string,
    category: JudgingCategory,
    fields: Record<string, number>
  ) => {
    const average = mean(Object.values(fields));
    if (average === null) return;
    rubricRecords.push({
      teamId,
      category,
      roomId: roomByTeam.get(teamId) ?? null,
      fields,
      average
    });
  };

  for (const rubric of finalRubrics) {
    if (rubric.category === 'core-values') {
      const awards = Object.entries(rubric.data?.awards ?? {})
        .filter(([, nominated]) => nominated)
        .map(([award]) => award);
      if (awards.length > 0) nominations.set(rubric.teamId, awards);
      continue;
    }
    makeRecord(rubric.teamId, rubric.category, toNumericFields(rubric.data?.fields));
  }

  // Core Values scores are inferred from CV-flagged fields of the IP and RD rubrics
  for (const teamId of teamMap.keys()) {
    const ip = finalRubrics.find(r => r.teamId === teamId && r.category === 'innovation-project');
    const rd = finalRubrics.find(r => r.teamId === teamId && r.category === 'robot-design');
    if (!ip && !rd) continue;
    makeRecord(
      teamId,
      'core-values',
      toNumericFields(inferCoreValuesFields(edition, ip?.data, rd?.data))
    );
  }

  return {
    division,
    edition,
    scoresheetSchema,
    rubricsSchema,
    teams: teamMap,
    tables: new Map(tables.map(table => [table.id, table.name])),
    rooms: new Map(rooms.map(room => [room.id, room.name])),
    matches: matchRecords,
    sessions: sessionRecords,
    scoresheets: scoresheetRecords,
    scoresheetTotal: scoresheets.length,
    rubrics: rubricRecords,
    rubricTotal: rubrics.filter(r => r.category !== 'core-values').length,
    nominations
  };
};

const cache = new Map<string, { expires: number; data: Promise<DivisionInsightsData> }>();

/**
 * Loads and normalizes all the data needed to compute insights for a division.
 * Results are cached briefly so switching between dashboards and explorer queries
 * doesn't reload the whole division each time.
 */
export const getDivisionInsightsData = (division: Division): Promise<DivisionInsightsData> => {
  const now = Date.now();
  for (const [key, entry] of cache) {
    if (entry.expires <= now) cache.delete(key);
  }

  const cached = cache.get(division.id);
  if (cached) return cached.data;

  const data = loadDivisionInsightsData(division);
  cache.set(division.id, { expires: now + CACHE_TTL_MS, data });
  data.catch(() => cache.delete(division.id));
  return data;
};
