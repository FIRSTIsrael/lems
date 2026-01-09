import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { useTranslations } from 'next-intl';
import type { AgendaEvent, RobotGameMatch, RobotGameTable, Team } from '../graphql/types';
import { MatchRow } from './match-row';
import { AgendaEventRow } from './agenda-event-row';

interface RoundScheduleProps {
  matches: RobotGameMatch[];
  tables: RobotGameTable[];
  teams: Team[];
  rows: Array<{ type: 'match'; data: RobotGameMatch } | { type: 'event'; data: AgendaEvent }>;
}

export const RoundSchedule: React.FC<RoundScheduleProps> = ({ matches, tables, teams, rows }) => {
  const t = useTranslations('pages.reports.field-schedule');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  if (matches.length === 0) return null;

  const firstMatch = matches[0];
  const stageKey = firstMatch.stage.toLowerCase() as 'practice' | 'ranking' | 'test';
  const roundTitle = `${t(`stages.${stageKey}`)} ${firstMatch.round}`;

  return (
    <TableContainer component={Paper} sx={{ p: 0, bgcolor: 'white', mb: 4 }}>
      <Table
        size="small"
        sx={{
          tableLayout: 'fixed',
          width: '100%',
          minWidth: Math.max(400, 100 + tables.length * 100)
        }}
      >
        <TableHead>
          <TableRow sx={{ bgcolor: 'grey.100' }}>
            <TableCell colSpan={tables.length + 3}>
              <Typography variant="h6" fontWeight={600} fontSize={isMobile ? '0.875rem' : '1rem'}>
                {roundTitle}
              </Typography>
            </TableCell>
          </TableRow>
          <TableRow sx={{ bgcolor: 'grey.100' }}>
            <TableCell align="center">
              <Typography fontWeight={600} fontSize={isMobile ? '0.75rem' : '1rem'}>
                {t('columns.match')}
              </Typography>
            </TableCell>
            <TableCell align="center">
              <Typography fontWeight={600} fontSize={isMobile ? '0.75rem' : '1rem'}>
                {t('columns.start-time')}
              </Typography>
            </TableCell>
            <TableCell align="center">
              <Typography fontWeight={600} fontSize={isMobile ? '0.75rem' : '1rem'}>
                {t('columns.end-time')}
              </Typography>
            </TableCell>
            {tables.map(table => (
              <TableCell key={table.id} align="center">
                <Typography fontWeight={600} fontSize={isMobile ? '0.75rem' : '1rem'}>
                  {table.name}
                </Typography>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, index) =>
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
