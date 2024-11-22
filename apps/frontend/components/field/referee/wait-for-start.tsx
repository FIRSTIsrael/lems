import { WithId } from 'mongodb';
import dayjs from 'dayjs';
import { Paper, Stack, Typography, Button, Box } from '@mui/material';
import { RobotGameMatch, RobotGameMatchParticipant } from '@lems/types';
import { localizeTeam } from '../../../localization/teams';
import { localizedMatchPresent, localizedMatchStage } from '../../../localization/field';

interface WaitForMatchStartProps {
  match: WithId<RobotGameMatch>;
  participant: RobotGameMatchParticipant;
  updateMatchParticipant: (match: Partial<RobotGameMatchParticipant>) => void;
}

const WaitForMatchStart: React.FC<WaitForMatchStartProps> = ({
  match,
  participant,
  updateMatchParticipant
}) => {
  return (
    <Paper sx={{ mt: 4, p: 4 }}>
      <Typography fontSize="1.5rem" fontWeight={700}>
        המתינו להתחלת מקצה #{match.number} סבב {localizedMatchStage[match.stage]} {match.round} (
        {dayjs(match.scheduledTime).format('HH:mm')})
      </Typography>
      {participant.team && (
        <Typography color="textSecondary" fontSize="1.125rem" mb={4}>
          {localizeTeam(participant.team)} ({localizedMatchPresent[participant.present]})
        </Typography>
      )}

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
          onClick={() => updateMatchParticipant({ ready: false })}
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
