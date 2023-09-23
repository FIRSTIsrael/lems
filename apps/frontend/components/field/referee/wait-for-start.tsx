import { RobotGameMatch, Team } from '@lems/types';
import { Paper, Stack, Typography, Button, Box } from '@mui/material';
import { WithId } from 'mongodb';
import { localizeTeam } from '../../../localization/teams';
import { localizedMatchPresent } from '../../../localization/field';

interface WaitForMatchStartProps {
  match: WithId<RobotGameMatch>;
  updateMatch: (match: Partial<RobotGameMatch>) => void;
}

const WaitForMatchStart: React.FC<WaitForMatchStartProps> = ({ match, updateMatch }) => {
  return (
    <Paper sx={{ mt: 4, p: 4 }}>
      <Typography fontSize="1.5rem" fontWeight={700}>
        המתינו להתחלת מקצה {match.number}
      </Typography>
      <Typography color="textSecondary" fontSize="1.125rem" mb={4}>
        {localizeTeam(match.team as Team)} ({localizedMatchPresent[match.present]})
      </Typography>

      <Stack alignItems="center" mt={4}>
        <Box
          sx={{
            display: 'inline-block',
            color: '#22c55e',
            background: 'linear-gradient(140deg, #dcfce7, #f0fdf4)',
            fontSize: '2.5rem',
            fontWeight: 900,
            textAlign: 'center',
            borderRadius: 3,
            py: 2,
            px: 8,
            mb: 6
          }}
        >
          ALL SET
        </Box>
        <Button
          onClick={() => updateMatch({ ready: false })}
          variant="contained"
          color="error"
          size="small"
        >
          רגע, אנחנו לא מוכנים
        </Button>
      </Stack>
    </Paper>
  );
};

export default WaitForMatchStart;
