import { WithId } from 'mongodb';
import { Team, RobotGameMatch } from '@lems/types';
import SouthRoundedIcon from '@mui/icons-material/SouthRounded';
import JoinFullRoundedIcon from '@mui/icons-material/JoinFullRounded';
import { TableRow, TableCell, IconButton, Button } from '@mui/material';

interface ActionRowProps {
  teams: Array<WithId<Team>>;
  fromMatch: WithId<RobotGameMatch>;
  toMatch: WithId<RobotGameMatch>;
  allowMerge?: boolean;
  onSwitchParticipants: (
    fromMatch: WithId<RobotGameMatch>,
    toMatchId: WithId<RobotGameMatch>,
    participantIndex: number
  ) => void;
  onMergeMatches: (fromMatch: WithId<RobotGameMatch>, toMatch: WithId<RobotGameMatch>) => void;
}

const ActionRow: React.FC<ActionRowProps> = ({
  teams,
  fromMatch,
  toMatch,
  allowMerge,
  onSwitchParticipants,
  onMergeMatches
}) => {
  const canMerge = fromMatch.participants
    .map((participant, index) => {
      const moving = participant.teamId && teams.find(team => team._id === participant.teamId);
      const canMove =
        toMatch.participants[index].teamId === null ||
        !teams.find(team => team._id === toMatch.participants[index].teamId)?.registered;
      return (moving && canMove) || !moving;
    })
    .every(Boolean);

  return (
    <TableRow>
      <TableCell align="center" colSpan={2}>
        {allowMerge && (
          <Button
            startIcon={<JoinFullRoundedIcon />}
            size="small"
            color="primary"
            sx={{ px: 2 }}
            disabled={!canMerge}
            onClick={() => onMergeMatches(fromMatch, toMatch)}
          >
            מיזוג
          </Button>
        )}
      </TableCell>
      {fromMatch.participants.map((participant, index) => {
        const moving = participant.teamId && teams.find(team => team._id === participant.teamId);
        const canMove =
          toMatch.participants[index].teamId === null ||
          !teams.find(team => team._id === toMatch.participants[index].teamId)?.registered;

        return (
          <TableCell key={index} align="center">
            {moving && (
              <IconButton
                size="small"
                color="primary"
                disabled={!canMove}
                onClick={() => onSwitchParticipants(fromMatch, toMatch, index)}
              >
                <SouthRoundedIcon />
              </IconButton>
            )}
          </TableCell>
        );
      })}
    </TableRow>
  );
};

export default ActionRow;
