import { WithId } from 'mongodb';
import dayjs from 'dayjs';
import { RobotGameMatch, Team } from '@lems/types';
import { TableRow, TableCell } from '@mui/material';
import StyledTeamTooltip from '../../general/styled-team-tooltip';

interface MatchRowProps {
  match: WithId<RobotGameMatch>;
  teams: Array<WithId<Team>>;
}

const MatchRow: React.FC<MatchRowProps> = ({ match, teams }) => {
  return (
    <TableRow>
      <TableCell align="center">{match.number}</TableCell>
      <TableCell align="center">{dayjs(match.scheduledTime).format('HH:mm')}</TableCell>
      {match.participants.map((participant, index) => {
        const team = teams.find(team => team._id === participant.teamId);
        return (
          <TableCell key={index} align="center">
            {team ? <StyledTeamTooltip team={team} /> : '-'}
          </TableCell>
        );
      })}
    </TableRow>
  );
};

export default MatchRow;
