import dayjs from 'dayjs';
import { gql, TypedDocumentNode } from '@apollo/client';
import { QueryData, QueryVars, AgendaEvent, RobotGameMatch } from './types';

export const GET_FIELD_SCHEDULE: TypedDocumentNode<QueryData, QueryVars> = gql`
  query GetFieldSchedule($divisionId: String!) {
    division(id: $divisionId) {
      id
      teams {
        id
        number
        name
        affiliation
        city
        region
        arrived
      }
      tables {
        id
        name
      }
      agenda(visibility: ["public", "field"]) {
        id
        title
        startTime
        duration
        visibility
      }
      field {
        divisionId
        matches {
          id
          slug
          stage
          round
          number
          scheduledTime
          status
          called
          participants {
            id
            team {
              id
              number
              name
            }
            table {
              id
              name
            }
            present
            queued
            ready
          }
        }
      }
    }
  }
`;

export function parseFieldScheduleData(data: QueryData) {
  if (!data.division) {
    return { teams: [], tables: [], roundMatches: {}, roundRowsMap: {} };
  }

  const { teams, tables, field, agenda } = data.division;
  const matches = field.matches.filter(m => m.stage !== 'TEST');

  // Sort matches by number
  const sortedMatches = [...matches].sort((a, b) => a.number - b.number);

  // Create rows combining matches and agenda events, sorted by time
  const rows: Array<
    { type: 'match'; data: RobotGameMatch } | { type: 'event'; data: AgendaEvent }
  > = [];

  sortedMatches.forEach((match, index) => {
    const matchTime = dayjs(match.scheduledTime);
    const previousMatchTime = index > 0 ? dayjs(sortedMatches[index - 1].scheduledTime) : null;

    // Insert agenda events that fall before this match
    agenda.forEach(event => {
      const eventStart = dayjs(event.startTime);
      if (eventStart.isAfter(previousMatchTime || dayjs(0)) && eventStart.isBefore(matchTime)) {
        rows.push({ type: 'event', data: event });
      }
    });

    rows.push({ type: 'match', data: match });
  });

  // Add events after the last match
  const lastMatchTime = dayjs(sortedMatches[sortedMatches.length - 1].scheduledTime);
  agenda.forEach(event => {
    const eventStart = dayjs(event.startTime);
    if (eventStart.isAfter(lastMatchTime)) {
      rows.push({ type: 'event', data: event });
    }
  });

  // Group matches by round (stage + round number), excluding test matches
  const roundMatches = matches.reduce(
    (result: { [key: string]: typeof matches }, match) => {
      const roundKey = `${match.stage}-${match.round}`;
      (result[roundKey] = result[roundKey] || []).push(match);
      return result;
    },
    {} as { [key: string]: typeof matches }
  );

  // Create a map of match IDs to their indices in the rows array
  const matchIdToRowIndex = new Map<string, number>();
  rows.forEach((row, index) => {
    if (row.type === 'match') {
      matchIdToRowIndex.set(row.data.id, index);
    }
  });

  // Sort round keys chronologically by the scheduled time of their first match
  const sortedRoundKeys = Object.keys(roundMatches).sort((a, b) => {
    const firstMatchA = roundMatches[a][0];
    const firstMatchB = roundMatches[b][0];
    return dayjs(firstMatchA.scheduledTime).diff(dayjs(firstMatchB.scheduledTime));
  });

  // For each round, slice the rows array to get only events that belong to that round
  const roundRowsMap = sortedRoundKeys.reduce(
    (result: { [key: string]: typeof rows }, roundKey, roundIndex) => {
      const isFirstRound = roundIndex === 0;
      const isLastRound = roundIndex === sortedRoundKeys.length - 1;

      // Find start index (0 for first round, first match of current round for others)
      const startIndex = isFirstRound
        ? 0
        : matchIdToRowIndex.get(roundMatches[roundKey][0].id);

      // Find end index (last row for last round, first match of next round for others)
      const endIndex = isLastRound
        ? rows.length
        : matchIdToRowIndex.get(roundMatches[sortedRoundKeys[roundIndex + 1]][0].id);

      result[roundKey] = rows.slice(startIndex, endIndex);

      return result;
    },
    {}
  );

  return {
    teams,
    tables,
    roundMatches,
    roundRowsMap
  };
}
