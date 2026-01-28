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

  // If no matches, return empty data
  if (sortedMatches.length === 0) {
    return { teams: [], tables: [], roundMatches: {}, roundRowsMap: {} };
  }

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

  // For each round, create rows with only matches and events that belong to that round
  const roundRowsMap = sortedRoundKeys.reduce(
    (result: { [key: string]: typeof rows }, roundKey, roundIndex) => {
      const currentRoundMatches = roundMatches[roundKey];
      const roundRows: typeof rows = [];

      // Get time boundaries for this round
      const lastMatchTime = dayjs(currentRoundMatches[currentRoundMatches.length - 1].scheduledTime);
      
      // Get the start boundary (before first match of this round)
      const startBoundary = roundIndex > 0 
        ? dayjs(roundMatches[sortedRoundKeys[roundIndex - 1]][roundMatches[sortedRoundKeys[roundIndex - 1]].length - 1].scheduledTime)
        : dayjs(0);
      
      // Get the end boundary (before first match of next round, or infinity for last round)
      const endBoundary = roundIndex < sortedRoundKeys.length - 1
        ? dayjs(roundMatches[sortedRoundKeys[roundIndex + 1]][0].scheduledTime)
        : dayjs('9999-12-31');

      // Add matches and events for this round in chronological order
      currentRoundMatches.forEach((match, matchIndex) => {
        const matchTime = dayjs(match.scheduledTime);
        const previousMatchTime = matchIndex > 0 
          ? dayjs(currentRoundMatches[matchIndex - 1].scheduledTime)
          : startBoundary;

        // Add agenda events that fall between previous match and this match
        agenda.forEach(event => {
          const eventStart = dayjs(event.startTime);
          if (eventStart.isAfter(previousMatchTime) && eventStart.isBefore(matchTime)) {
            roundRows.push({ type: 'event', data: event });
          }
        });

        // Add the match
        roundRows.push({ type: 'match', data: match });
      });

      // Add events after the last match of this round but before the next round
      agenda.forEach(event => {
        const eventStart = dayjs(event.startTime);
        if (eventStart.isAfter(lastMatchTime) && eventStart.isBefore(endBoundary)) {
          roundRows.push({ type: 'event', data: event });
        }
      });

      result[roundKey] = roundRows;

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
