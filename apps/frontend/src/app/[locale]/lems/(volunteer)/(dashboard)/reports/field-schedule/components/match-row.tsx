import {
  Box,
  TableCell,
  TableRow,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { Block as BlockIcon } from '@mui/icons-material';
import { useTranslations } from 'next-intl';
import dayjs from 'dayjs';
import type { RobotGameMatch, RobotGameTable, Team } from '../graphql/types';

interface MatchRowProps {
  match: RobotGameMatch;
  tables: RobotGameTable[];
  teams: Team[];
}

const MATCH_LENGTH = 150; // seconds

export const MatchRow: React.FC<MatchRowProps> = ({ match, tables, teams }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const t = useTranslations('pages.reports.field-schedule');

  const startTime = dayjs(match.scheduledTime);
  const endTime = startTime.add(MATCH_LENGTH, 'seconds');

  // Create a map of table ID to participant
  const tableParticipants = new Map(match.participants.map(p => [p.table.id, p] as const));

  // Determine row styling based on match status
  const isCompleted = match.status === 'completed';
  const rowSx = isCompleted ? { bgcolor: 'action.hover' } : { bgcolor: 'white' };

  return (
    <TableRow sx={rowSx}>
      <TableCell align="center">
        <Typography
          fontFamily="monospace"
          fontWeight={500}
          fontSize={isMobile ? '0.75rem' : '1rem'}
        >
          {match.number}
        </Typography>
      </TableCell>
      <TableCell align="center">
        <Typography
          fontFamily="monospace"
          fontWeight={500}
          fontSize={isMobile ? '0.75rem' : '1rem'}
        >
          {startTime.format('HH:mm')}
        </Typography>
      </TableCell>
      <TableCell align="center">
        <Typography
          fontFamily="monospace"
          fontWeight={500}
          fontSize={isMobile ? '0.75rem' : '1rem'}
        >
          {endTime.format('HH:mm')}
        </Typography>
      </TableCell>
      {tables.map(table => {
        const participant = tableParticipants.get(table.id);
        const team = participant?.team ? teams.find(t => t.id === participant.team?.id) : null;

        return (
          <TableCell key={table.id} align="center">
            {team ? (
              <Tooltip title={`${team.name} ${team.arrived ? '' : `(${t('not-arrived')})`}`} arrow>
                <Box
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.5,
                    cursor: 'default'
                  }}
                >
                  {!team.arrived && (
                    <BlockIcon
                      sx={{
                        fontSize: isMobile ? 14 : 16,
                        color: 'error.main'
                      }}
                    />
                  )}
                  <Typography
                    component="span"
                    sx={{
                      fontSize: isMobile ? '0.75rem' : '1rem'
                    }}
                  >
                    #{team.number}
                  </Typography>
                </Box>
              </Tooltip>
            ) : (
              <Typography fontSize={isMobile ? '0.75rem' : '1rem'}>-</Typography>
            )}
          </TableCell>
        );
      })}
    </TableRow>
  );
};
