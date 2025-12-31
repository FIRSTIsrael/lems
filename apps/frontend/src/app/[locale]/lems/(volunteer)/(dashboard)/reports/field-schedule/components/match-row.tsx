import { TableCell, TableRow } from '@mui/material';
import dayjs from 'dayjs';
import type { RobotGameMatch, RobotGameTable, Team } from '../graphql/types';

interface MatchRowProps {
  match: RobotGameMatch;
  tables: RobotGameTable[];
  teams: Team[];
}

const MATCH_LENGTH = 150; // seconds

export const MatchRow: React.FC<MatchRowProps> = ({ match, tables, teams }) => {
  const startTime = dayjs(match.scheduledTime);
  const endTime = startTime.add(MATCH_LENGTH, 'seconds');

  // Create a map of table ID to participant
  const tableParticipants = new Map(match.participants.map(p => [p.table.id, p] as const));

  // Determine row styling based on match status
  const isCompleted = match.status === 'completed';
  const rowSx = isCompleted ? { backgroundColor: 'action.hover' } : {};

  return (
    <TableRow sx={rowSx}>
      <TableCell>{match.number}</TableCell>
      <TableCell>{startTime.format('HH:mm')}</TableCell>
      <TableCell>{endTime.format('HH:mm')}</TableCell>
      {tables.map(table => {
        const participant = tableParticipants.get(table.id);
        const team = participant?.team ? teams.find(t => t.id === participant.team?.id) : null;

        return (
          <TableCell key={table.id} align="center">
            {team ? `#${team.number}` : '-'}
          </TableCell>
        );
      })}
    </TableRow>
  );
};
