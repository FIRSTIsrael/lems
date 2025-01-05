import { WithId } from 'mongodb';
import dayjs from 'dayjs';
import { RobotGameMatch } from '@lems/types';
import { TableRow, TableCell } from '@mui/material';
import StyledTeamTooltip from '../../general/styled-team-tooltip';

interface MatchRowProps {
  match: WithId<RobotGameMatch>;
}

const MatchRow: React.FC<MatchRowProps> = ({ match }) => {
  return (
    <TableRow>
      <TableCell align="center">{match.number}</TableCell>
      <TableCell align="center">{dayjs(match.scheduledTime).format('HH:mm')}</TableCell>
      {match.participants.map((participant, index) => (
        <TableCell key={index} align="center">
          {participant.team ? <StyledTeamTooltip team={participant.team} /> : '-'}
        </TableCell>
      ))}
    </TableRow>
  );
};

export default MatchRow;
