import { RobotGameMatch, RobotGameMatchParticipant } from '@lems/types';
import { Paper, Stack, Typography, Button } from '@mui/material';
import { WithId } from 'mongodb';
import { localizeTeam } from '../../../localization/teams';
import PresentSwitch from './present-switch';

interface MatchPrestartProps {
  participant: RobotGameMatchParticipant;
  match: WithId<RobotGameMatch>;
  updateMatchParticipant: (match: Partial<RobotGameMatchParticipant>) => void;
}

const MatchPrestart: React.FC<MatchPrestartProps> = ({
  participant,
  match,
  updateMatchParticipant
}) => {
  return (
    <Paper sx={{ mt: 4, p: 4 }}>
      {participant.team && (
        <>
          <Typography fontSize="1.5rem" fontWeight={700}>
            הכנה למקצה {match.number}
          </Typography>

          <Typography color="textSecondary" fontSize="1.125rem" mb={4}>
            {localizeTeam(participant.team)}
          </Typography>

          {participant.team.registered ? (
            <PresentSwitch
              value={participant.present}
              onChange={present => updateMatchParticipant({ present })}
            />
          ) : (
            <Typography fontSize="1.125rem" fontWeight={700}>
              שימו לב: הקבוצה טרם הגיעה לאירוע
            </Typography>
          )}

          <Stack alignItems="center" mt={6}>
            <Button
              onClick={() => updateMatchParticipant({ ready: true })}
              variant="contained"
              color="primary"
            >
              אנחנו מוכנים!
            </Button>
          </Stack>
        </>
      )}
    </Paper>
  );
};

export default MatchPrestart;
