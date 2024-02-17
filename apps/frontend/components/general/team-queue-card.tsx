import { WithId } from 'mongodb';
import { PaperProps, Paper, Typography } from '@mui/material';
import { red } from '@mui/material/colors';
import { Team } from '@lems/types';

interface TeamQueueCardProps extends PaperProps {
  team: WithId<Team>;
  urgent: boolean;
}

const TeamQueueCard: React.FC<TeamQueueCardProps> = ({ team, urgent, ...props }) => {
  return (
    <Paper
      sx={{
        px: 1,
        py: 2,
        mt: 1,
        ...(urgent && { backgroundColor: red[200] })
      }}
    >
      <Typography>{team.number}</Typography>
    </Paper>
  );
};

export default TeamQueueCard;
