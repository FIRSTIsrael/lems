import { useState, useMemo, useEffect } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import { WithId } from 'mongodb';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Paper,
  Stack,
  Typography
} from '@mui/material';
import { RobotGameMatch, RobotGameMatchParticipant, MATCH_LENGTH, Scoresheet } from '@lems/types';
import Countdown from '../../general/countdown';
import { localizeTeam } from '../../../localization/teams';
import FlippedLinearProgress from '../../general/flipped-linear-progress';

interface TimerProps {
  participant: RobotGameMatchParticipant;
  match: WithId<RobotGameMatch>;
  getScoresheet?: (fromMatch: WithId<RobotGameMatch>) => Promise<WithId<Scoresheet>>;
  toScoresheet?: (participant: RobotGameMatchParticipant, scoresheet: WithId<Scoresheet>) => void;
}

const Timer: React.FC<TimerProps> = ({ participant, match, getScoresheet, toScoresheet }) => {
  const matchEnd = dayjs(match.startTime).add(MATCH_LENGTH, 'seconds');
  const [currentTime, setCurrentTime] = useState<Dayjs>(dayjs());
  const [isOpen, setIsOpen] = useState<boolean>(false);

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(dayjs()), 100);
    return () => {
      clearInterval(interval);
    };
  });

  const percentLeft = useMemo(
    () => matchEnd.diff(currentTime) / (10 * MATCH_LENGTH),
    [currentTime, matchEnd]
  );

  const handleEarlyScoring = () => {
    if (getScoresheet && toScoresheet)
      getScoresheet(match).then(scoresheet => toScoresheet(participant, scoresheet));
  };

  return (
    <>
      <Paper sx={{ mt: 4, py: 4, px: 2, textAlign: 'center' }}>
        <Countdown
          targetDate={matchEnd.toDate()}
          expiredText="00:00"
          variant="h1"
          fontFamily="Roboto Mono"
          fontSize="5rem"
          fontWeight={700}
          dir="ltr"
        />
        {participant.team && (
          <Typography variant="h4" fontSize="1.5rem" fontWeight={400} gutterBottom>
            {localizeTeam(participant.team)}
          </Typography>
        )}
      </Paper>
      <FlippedLinearProgress
        variant="determinate"
        value={percentLeft}
        color={percentLeft <= 20 ? 'error' : 'primary'}
        sx={{
          height: 16,
          borderBottomLeftRadius: 8,
          borderBottomRightRadius: 8,
          mt: -2
        }}
      />

      {participant.team?.registered &&
        participant.present === 'present' &&
        getScoresheet &&
        toScoresheet && (
          <>
            <Stack alignItems="center" mt={6}>
              <Button
                onClick={() => setIsOpen(true)}
                variant="contained"
                color="error"
                sx={{ py: 2, px: 6 }}
                size="large"
              >
                התחלת הניקוד
              </Button>
            </Stack>
            <Dialog
              open={isOpen}
              onClose={() => setIsOpen(false)}
              aria-labelledby="start-scoring-title"
              aria-describedby="start-scoring-description"
            >
              <DialogTitle id="start-scoring-title">סיום המקצה והתחלת הניקוד</DialogTitle>
              <DialogContent>
                <DialogContentText id="start-scoring-description">
                  אתם עומדים לסיים את המקצה של הקבוצה בטרם עת ולעבור לדף הניקוד. שימו לב כי לא תוכלו
                  לבטל פעולה זאת, וכי יש להמשיך רק אם חברי הקבוצה הודיעו לכם שהם סיימו להפעיל את
                  הרובוט למקצה זה.
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setIsOpen(false)}>ביטול</Button>
                <Button onClick={handleEarlyScoring} autoFocus>
                  אישור
                </Button>
              </DialogActions>
            </Dialog>
          </>
        )}
    </>
  );
};

export default Timer;
