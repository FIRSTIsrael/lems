import { RobotGameMatch, Team } from '@lems/types';
import { Paper, Stack, Typography, Button } from '@mui/material';
import { WithId } from 'mongodb';
import { localizeTeam } from '../../../localization/teams';
import PresentSwitch from './present-switch';

interface MatchPrestartProps {
  match: WithId<RobotGameMatch>;
  updateMatch: (match: Partial<RobotGameMatch>) => void;
}

const MatchPrestart: React.FC<MatchPrestartProps> = ({ match, updateMatch }) => {
  return (
    <Paper sx={{ mt: 4, p: 4 }}>
      <Typography fontSize="1.5rem" fontWeight={700}>
        הכנה למקצה {match.number}
      </Typography>
      <Typography color="textSecondary" fontSize="1.125rem" mb={4}>
        {localizeTeam(match.team as Team)}
      </Typography>

      <PresentSwitch value={match.present} onChange={present => updateMatch({ present })} />

      <Stack alignItems="center" mt={6}>
        <Button onClick={() => updateMatch({ ready: true })} variant="contained" color="primary">
          אנחנו מוכנים!
        </Button>
      </Stack>
    </Paper>
  );
};

export default MatchPrestart;
