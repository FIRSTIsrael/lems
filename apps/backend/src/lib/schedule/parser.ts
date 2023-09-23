import dayjs from 'dayjs';
import { WithId } from 'mongodb';
import { parse } from 'csv-parse/sync';
import {
  Team,
  Event,
  RobotGameTable,
  RobotGameMatch,
  JudgingRoom,
  JudgingSession,
  RobotGameMatchType
} from '@lems/types';

type CSVLine = Record<string, string>;
type Line = string[];
type Block = { id: number; lines: Line[] };

const TEAMS_BLOCK_ID = 1;
const PRACTICE_MATCHES_BLOCK_ID = 4;
const RANKING_MATCHES_BLOCK_ID = 2;
const JUDGING_SESSIONS_BLOCK_ID = 3;

const getBlock = (blocks: Array<Block>, id: number) => {
  const block = blocks.find(b => b.id === id)?.lines;
  return structuredClone(block);
};

const parseBlocks = (file: CSVLine[]): Array<Block> => {
  const blocks = [];
  for (let i = 0; i < file.length; i++) {
    if (file[i][0] === 'Block Format') {
      const blockId = parseInt(file[i][1]);
      // New Block starts
      const blockLines = [];
      for (let j = i + 1; j < file.length; j++) {
        // Add all lines until next block
        if (file[j][0] !== 'Block Format') {
          blockLines.push(Object.values(file[j]));
        } else {
          // Skip to the next block
          i = j - 1;
          break;
        }
      }
      blocks.push({ id: blockId, lines: blockLines });
    }
  }
  return blocks;
};

const parseTeams = (lines: Line[], event: WithId<Event>) => {
  const LINES_TO_SKIP = 1;
  lines = (lines || []).splice(LINES_TO_SKIP);

  return lines.map(
    rawTeam =>
      ({
        event: event._id,
        number: parseInt(rawTeam[0]),
        name: rawTeam[1],
        registered: false,
        affiliation: {
          institution: rawTeam[2],
          city: rawTeam[3]
        }
      } as Team)
  );
};

const parseTables = (lines: Line[], event: WithId<Event>) => {
  const LINES_TO_SKIP = 4;
  lines = (lines || []).splice(LINES_TO_SKIP);

  const tables = (lines.shift() || []).slice(1).filter(name => name.trim() !== '');

  return tables.map(
    name =>
      ({
        event: event._id,
        name
      } as RobotGameTable)
  );
};

const parseRooms = (lines: Line[], event: WithId<Event>) => {
  const LINES_TO_SKIP = 4;
  lines = (lines || []).splice(LINES_TO_SKIP);

  const rooms = (lines.shift() || []).slice(1).filter(name => name.trim() !== '');

  return rooms.map(
    name =>
      ({
        event: event._id,
        name
      } as JudgingRoom)
  );
};

export const parseEventData = async (event: WithId<Event>, csvData: string) => {
  const file = parse(csvData.trim());
  const version = parseInt(file.shift()?.[1]); //Version number: 2nd cell of 1st row.
  if (version !== 2) Promise.reject('LEMS can only parse version 2 schedules');

  const blocks = parseBlocks(file);
  const teams = parseTeams(getBlock(blocks, TEAMS_BLOCK_ID), event);
  const tables = parseTables(getBlock(blocks, PRACTICE_MATCHES_BLOCK_ID), event);
  const rooms = parseRooms(getBlock(blocks, JUDGING_SESSIONS_BLOCK_ID), event);

  return { teams, tables, rooms };
};

const parseMatches = (
  lines: Line[],
  type: RobotGameMatchType,
  event: WithId<Event>,
  teams: Array<WithId<Team>>,
  tables: Array<WithId<RobotGameTable>>
) => {
  const LINES_TO_SKIP = 4;
  lines = (lines || []).splice(LINES_TO_SKIP);
  const matches: RobotGameMatch[] = [];

  const tableNames = (lines.shift() || []).slice(1).filter(name => name.trim() !== '');

  lines.forEach(line => {
    const number = parseInt(line[0]);
    const round = parseInt(line[1]);
    const [hour, minute] = line[2].split(':');
    const startTime = dayjs(event.startDate)
      .set('hour', parseInt(hour))
      .set('minute', parseInt(minute))
      .set('second', 0);

    for (let i = 4; i < line.length; i++) {
      if (line[i]) {
        const table = tables.find(table => table.name === tableNames[i - 4]);
        const team = teams.find(team => team.number === parseInt(line[i]));

        matches.push({
          number,
          type,
          round,
          time: startTime.toDate(),
          team: team._id,
          table: table._id,
          ready: false,
          status: 'not-started'
        } as RobotGameMatch);
      }
    }
  });

  return matches;
};

const parseSessions = (
  lines: Line[],
  event: WithId<Event>,
  teams: Array<WithId<Team>>,
  rooms: Array<WithId<JudgingRoom>>
) => {
  const LINES_TO_SKIP = 4;
  lines = (lines || []).splice(LINES_TO_SKIP);
  const sessions: JudgingSession[] = [];

  const roomNames = (lines.shift() || []).slice(1).filter(name => name.trim() !== '');

  lines.forEach(line => {
    const number = parseInt(line[0]);
    const [hour, minute] = line[1].split(':');
    const startTime = dayjs(event.startDate)
      .set('hour', parseInt(hour))
      .set('minute', parseInt(minute))
      .set('second', 0);

    for (let i = 3; i < line.length; i++) {
      if (line[i]) {
        const room = rooms.find(table => table.name === roomNames[i - 3]);
        const team = teams.find(team => team.number === parseInt(line[i]));

        sessions.push({
          number,
          time: startTime.toDate(),
          team: team._id,
          room: room._id,
          status: 'not-started'
        } as JudgingSession);
      }
    }
  });

  return sessions;
};

export const parseEventSchedule = async (
  event: WithId<Event>,
  teams: Array<WithId<Team>>,
  tables: Array<WithId<RobotGameTable>>,
  rooms: Array<WithId<JudgingRoom>>,
  csvData: string
) => {
  const file = parse(csvData.trim());
  const version = parseInt(file.shift()?.[1]); //Version number: 2nd cell of 1st row.
  if (version !== 2) Promise.reject('LEMS can only parse version 2 schedules');

  const blocks = parseBlocks(file);
  const practiceMatches = parseMatches(
    getBlock(blocks, PRACTICE_MATCHES_BLOCK_ID),
    'practice',
    event,
    teams,
    tables
  );
  const rankingMatches = parseMatches(
    getBlock(blocks, RANKING_MATCHES_BLOCK_ID),
    'ranking',
    event,
    teams,
    tables
  );
  const matches = practiceMatches.concat(rankingMatches);
  const sessions = parseSessions(getBlock(blocks, JUDGING_SESSIONS_BLOCK_ID), event, teams, rooms);

  return { matches, sessions };
};
