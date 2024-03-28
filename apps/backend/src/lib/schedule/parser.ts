import dayjs from 'dayjs';
import { ObjectId, WithId } from 'mongodb';
import { parse } from 'csv-parse/sync';
import {
  Team,
  Event,
  EventState,
  RobotGameTable,
  RobotGameMatch,
  JudgingRoom,
  JudgingSession,
  RobotGameMatchStage
} from '@lems/types';
import { Line, getBlock, extractBlocksFromFile } from '../csv';

const TEAMS_BLOCK_ID = 1;
const PRACTICE_MATCHES_BLOCK_ID = 4;
const RANKING_MATCHES_BLOCK_ID = 2;
const JUDGING_SESSIONS_BLOCK_ID = 3;

const getTestMatch = (eventId: ObjectId): RobotGameMatch => {
  return {
    eventId,
    round: 0,
    stage: 'test',
    status: 'not-started',
    participants: []
  } as RobotGameMatch;
};

const extractTeamsFromBlock = (teamBlock: Line[], event: WithId<Event>): Array<Team> => {
  const LINES_TO_SKIP = 1;
  teamBlock = (teamBlock || []).splice(LINES_TO_SKIP);

  return teamBlock.map(teamLine => ({
    eventId: event._id,
    number: parseInt(teamLine[0]),
    name: teamLine[1],
    registered: false,
    affiliation: {
      name: teamLine[2],
      city: teamLine[3]
    }
  }));
};

const extractTablesFromBlock = (
  practiceMatchBlock: Line[],
  event: WithId<Event>
): Array<RobotGameTable> => {
  const LINES_TO_SKIP = 4;
  practiceMatchBlock = (practiceMatchBlock || []).splice(LINES_TO_SKIP);

  const tables = (practiceMatchBlock.shift() || []).slice(1).filter(name => name.trim() !== '');

  return tables.map(name => ({
    eventId: event._id,
    name
  }));
};

const extractJudgingRoomsFromBlock = (
  judgingBlock: Line[],
  event: WithId<Event>
): Array<JudgingRoom> => {
  const LINES_TO_SKIP = 4;
  judgingBlock = (judgingBlock || []).splice(LINES_TO_SKIP);

  const rooms = (judgingBlock.shift() || []).slice(1).filter(name => name.trim() !== '');

  return rooms.map(name => ({
    eventId: event._id,
    name
  }));
};

export const parseEventData = (
  event: WithId<Event>,
  csvData: string
): { teams: Array<Team>; tables: Array<RobotGameTable>; rooms: Array<JudgingRoom> } => {
  const file = parse(csvData.trim());
  const version = parseInt(file.shift()?.[1]); // Version number: 2nd cell of 1st row.
  if (version !== 2) Promise.reject('LEMS can only parse version 2 schedules');

  const blocks = extractBlocksFromFile(file);
  const teams = extractTeamsFromBlock(getBlock(blocks, TEAMS_BLOCK_ID), event);
  const tables = extractTablesFromBlock(getBlock(blocks, PRACTICE_MATCHES_BLOCK_ID), event);
  const rooms = extractJudgingRoomsFromBlock(getBlock(blocks, JUDGING_SESSIONS_BLOCK_ID), event);

  return { teams, tables, rooms };
};

const extractMatchesFromMatchBlock = (
  matchBlock: Line[],
  stage: RobotGameMatchStage,
  event: WithId<Event>,
  teams: Array<WithId<Team>>,
  tables: Array<WithId<RobotGameTable>>,
  timezone: string
): Array<RobotGameMatch> => {
  const LINES_TO_SKIP = 4;
  matchBlock = (matchBlock || []).splice(LINES_TO_SKIP);

  const matches: Array<RobotGameMatch> = [];
  const tableNames = (matchBlock.shift() || []).slice(1).filter(name => name.trim() !== '');

  matchBlock.forEach(line => {
    const round = parseInt(line[1]);
    const [hour, minute] = line[2].split(':');
    const startTime = dayjs(event.startDate)
      .tz(timezone, true)
      .set('hour', parseInt(hour))
      .set('minute', parseInt(minute))
      .set('second', 0);

    const match: RobotGameMatch = {
      eventId: event._id,
      round,
      number: parseInt(line[0]),
      stage,
      called: false,
      status: 'not-started',
      scheduledTime: startTime.toDate(),
      participants: []
    };

    for (let i = 4; i < tableNames.length + 4; i++) {
      const table = tables.find(table => table.name === tableNames[i - 4]);

      let team = null;
      if (line[i]) {
        team = teams.find(team => team.number === parseInt(line[i]));
      }

      match.participants.push({
        teamId: team?._id || null,
        tableId: table._id,
        tableName: table.name,
        queued: false,
        ready: false,
        present: 'no-show'
      });
    }

    matches.push(match);
  });

  return matches;
};

const extractSessionsFromJudgingBlock = (
  judgingBlock: Line[],
  event: WithId<Event>,
  teams: Array<WithId<Team>>,
  rooms: Array<WithId<JudgingRoom>>,
  timezone: string
): Array<JudgingSession> => {
  const LINES_TO_SKIP = 4;
  judgingBlock = (judgingBlock || []).splice(LINES_TO_SKIP);

  const sessions: Array<JudgingSession> = [];
  const roomNames = (judgingBlock.shift() || []).slice(1).filter(name => name.trim() !== '');

  judgingBlock.forEach(line => {
    const number = parseInt(line[0]);
    const [hour, minute] = line[1].split(':');
    const startTime = dayjs(event.startDate)
      .tz(timezone, true)
      .set('hour', parseInt(hour))
      .set('minute', parseInt(minute))
      .set('second', 0);

    for (let i = 3; i < roomNames.length + 3; i++) {
      const room = rooms.find(table => table.name === roomNames[i - 3]);
      const session: JudgingSession = {
        eventId: event._id,
        number,
        scheduledTime: startTime.toDate(),
        roomId: room._id,
        teamId: null,
        called: false,
        queued: false,
        status: 'not-started'
      };

      if (line[i]) {
        session.teamId = teams.find(team => team.number === parseInt(line[i]))._id;
      }

      sessions.push(session);
    }
  });

  return sessions;
};

export const parseSessionsAndMatches = (
  csvData: string,
  event: WithId<Event>,
  teams: Array<WithId<Team>>,
  tables: Array<WithId<RobotGameTable>>,
  rooms: Array<WithId<JudgingRoom>>,
  timezone = 'UTC'
): { matches: Array<RobotGameMatch>; sessions: Array<JudgingSession> } => {
  const file = parse(csvData.trim());
  const version = parseInt(file.shift()?.[1]); //Version number: 2nd cell of 1st row.
  if (version !== 2) Promise.reject('LEMS can only parse version 2 schedules');

  const blocks = extractBlocksFromFile(file);
  const practiceMatches = extractMatchesFromMatchBlock(
    getBlock(blocks, PRACTICE_MATCHES_BLOCK_ID),
    'practice',
    event,
    teams,
    tables,
    timezone
  );
  const rankingMatches = extractMatchesFromMatchBlock(
    getBlock(blocks, RANKING_MATCHES_BLOCK_ID),
    'ranking',
    event,
    teams,
    tables,
    timezone
  );
  const matches = practiceMatches.concat(rankingMatches);
  matches.push(getTestMatch(event._id));

  const sessions = extractSessionsFromJudgingBlock(
    getBlock(blocks, JUDGING_SESSIONS_BLOCK_ID),
    event,
    teams,
    rooms,
    timezone
  );

  return { matches, sessions };
};

export const getInitialEventState = (event: WithId<Event>): EventState => {
  const supportedPresentations = ['awards'];
  const presentations = Object.fromEntries(
    supportedPresentations.map(presentaionId => [
      presentaionId,
      {
        enabled: false,
        activeView: { slideIndex: 0, stepIndex: 0 }
      }
    ])
  );

  return {
    eventId: event._id,
    activeMatch: null,
    loadedMatch: null,
    currentStage: 'practice',
    currentRound: 1,
    currentSession: 0,
    audienceDisplay: {
      screen: 'scores',
      message: '',
      scoreboard: {
        showCurrentMatch: 'timer',
        showPreviousMatch: true,
        showSponsors: false
      }
    },
    presentations,
    completed: false,
    allowTeamExports: false
  };
};
