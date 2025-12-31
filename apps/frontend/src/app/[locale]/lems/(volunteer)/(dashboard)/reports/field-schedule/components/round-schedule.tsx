import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from '@mui/material';
import { useTranslations } from 'next-intl';
import dayjs from 'dayjs';
import type { AgendaEvent, RobotGameMatch, RobotGameTable, Team } from '../graphql/types';
import { MatchRow } from './match-row';
import { AgendaEventRow } from './agenda-event-row';

interface RoundScheduleProps {
  matches: RobotGameMatch[];
  tables: RobotGameTable[];
  teams: Team[];
  agendaEvents: AgendaEvent[];
}

export const RoundSchedule: React.FC<RoundScheduleProps> = ({
  matches,
  tables,
  teams,
  agendaEvents
}) => {
  const t = useTranslations('pages.reports.field-schedule');

  if (matches.length === 0) return null;

  const firstMatch = matches[0];
  const stageKey = firstMatch.stage.toLowerCase() as 'practice' | 'ranking' | 'test';
  const roundTitle = `${t(`stages.${stageKey}`)} ${firstMatch.round}`;

  // Sort matches by number
  const sortedMatches = [...matches].sort((a, b) => a.number - b.number);

  // Insert agenda events between matches based on scheduled time
  const rowsWithEvents: Array<
    { type: 'match'; data: RobotGameMatch } | { type: 'event'; data: AgendaEvent }
  > = [];

  sortedMatches.forEach((match, index) => {
    // Check for agenda events that should appear before this match
    const matchTime = dayjs(match.scheduledTime);
    const previousMatchTime = index > 0 ? dayjs(sortedMatches[index - 1].scheduledTime) : null;

    agendaEvents.forEach(event => {
      const eventStart = dayjs(event.start);

      // Insert event if it falls between previous match and current match
      if (eventStart.isAfter(previousMatchTime || dayjs(0)) && eventStart.isBefore(matchTime)) {
        rowsWithEvents.push({ type: 'event', data: event });
      }
    });

    rowsWithEvents.push({ type: 'match', data: match });
  });

  // Check for events after last match
  const lastMatchTime = dayjs(sortedMatches[sortedMatches.length - 1].scheduledTime);
  agendaEvents.forEach(event => {
    const eventStart = dayjs(event.start);
    if (eventStart.isAfter(lastMatchTime)) {
      rowsWithEvents.push({ type: 'event', data: event });
    }
  });

  return (
    <TableContainer component={Paper} sx={{ mb: 4 }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell colSpan={tables.length + 3}>
              <Typography variant="h6" fontWeight={600}>
                {roundTitle}
              </Typography>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>{t('columns.match')}</TableCell>
            <TableCell>{t('columns.start-time')}</TableCell>
            <TableCell>{t('columns.end-time')}</TableCell>
            {tables.map(table => (
              <TableCell key={table.id} align="center">
                {table.name}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rowsWithEvents.map((row, index) =>
            row.type === 'match' ? (
              <MatchRow key={row.data.id} match={row.data} tables={tables} teams={teams} />
            ) : (
              <AgendaEventRow
                key={`event-${row.data.id}-${index}`}
                event={row.data}
                tableCount={tables.length}
              />
            )
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
