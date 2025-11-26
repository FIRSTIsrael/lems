import { WithId } from 'mongodb';
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Button,
  IconButton
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { Team, RobotGameMatch, RobotGameMatchParticipant } from '@lems/types';
import dayjs from 'dayjs';
import { getBackgroundColor } from '../../lib/utils/theme';
import StyledTeamTooltip from '../general/styled-team-tooltip';

interface RematchSelectorRowProps {
  match: WithId<RobotGameMatch>;
  teams?: Array<WithId<Team>>;
  canSelect?: boolean;
  onSelect?: (participantIndex: number) => void;
}

const RematchSelectorRow: React.FC<RematchSelectorRowProps> = ({
  teams,
  match,
  canSelect = false,
  onSelect
}) => {
  if (canSelect && (!teams || !onSelect)) {
    console.error("Can't select rematch without teams or onSelect function");
  }

  const matchStart = dayjs(match.scheduledTime).format('HH:mm');
  const canSelectBg = getBackgroundColor('#77ea7e', 'light');
  const tableIsEmpty = (participant: RobotGameMatchParticipant) =>
    !participant.teamId || !teams?.find(team => team._id === participant.teamId)?.registered;

  return (
    <TableRow sx={{ backgroundColor: canSelect ? canSelectBg : undefined }}>
      <TableCell align="center">{match.number}</TableCell>
      <TableCell align="center">{matchStart}</TableCell>
      {match.participants.map((participant, index) => {
        const team = teams?.find(team => team._id === participant.teamId);
        return (
          <TableCell key={index} align="center">
            {canSelect && tableIsEmpty(participant) ? (
              team ? (
                <Button
                  variant="outlined"
                  onClick={() => onSelect?.(index)}
                  sx={{
                    color: 'grey.700',
                    borderColor: 'grey.500',
                    '&:hover': {
                      borderColor: 'grey.700'
                    }
                  }}
                >
                  <StyledTeamTooltip team={team} />
                </Button>
              ) : (
                <IconButton onClick={() => onSelect?.(index)}>
                  <AddCircleOutlineIcon />
                </IconButton>
              )
            ) : team ? (
              <StyledTeamTooltip team={team} />
            ) : (
              '-'
            )}
          </TableCell>
        );
      })}
    </TableRow>
  );
};

interface RematchSelectorProps {
  teams: Array<WithId<Team>>;
  previousMatch: WithId<RobotGameMatch> | null;
  match: WithId<RobotGameMatch>;
  nextMatch: WithId<RobotGameMatch> | null;
  onSelect: (participantIndex: number) => void;
}

const RematchSelector: React.FC<RematchSelectorProps> = ({
  teams,
  previousMatch,
  match,
  nextMatch,
  onSelect
}) => {
  const tables = match.participants.map(participant => participant.tableName);

  return (
    <TableContainer sx={{ border: '1px solid #e0e0e0', borderRadius: 1, overflow: 'auto', mt: 2 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell align="center">מקצה</TableCell>
            <TableCell align="center">התחלה</TableCell>
            {tables.map((tableName, index) => (
              <TableCell key={index} align="center">
                שולחן {tableName}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {previousMatch && <RematchSelectorRow match={previousMatch} />}
          <RematchSelectorRow teams={teams} match={match} canSelect onSelect={onSelect} />
          {nextMatch && <RematchSelectorRow match={nextMatch} />}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default RematchSelector;
