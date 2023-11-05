import { useContext } from 'react';
import dayjs from 'dayjs';
import { WithId } from 'mongodb';
import { Box, Paper, Stack, Tooltip, Typography } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import { green, red } from '@mui/material/colors';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import RemoveRoundedIcon from '@mui/icons-material/RemoveRounded';
import DoneRoundedIcon from '@mui/icons-material/DoneRounded';
import { JudgingSession, MATCH_LENGTH, RobotGameMatch } from '@lems/types';
import Countdown from '../../general/countdown';
import { TimeSyncContext } from '../../../lib/timesync';
import StyledTeamTooltip from '../../general/styled-team-tooltip';

interface ActiveMatchProps {
  title: React.ReactNode;
  match: WithId<RobotGameMatch> | null;
  startTime?: Date;
  activeSessions?: Array<WithId<JudgingSession>>;
}

const ActiveMatch: React.FC<ActiveMatchProps> = ({ title, match, startTime, activeSessions }) => {
  const { offset } = useContext(TimeSyncContext);
  const getCountdownTarget = (startTime: Date) =>
    dayjs(startTime).add(MATCH_LENGTH, 'seconds').subtract(offset, 'milliseconds').toDate();

  return (
    <Paper sx={{ p: 2, flex: 1 }}>
      <Typography component="h2" fontSize="1.125rem" fontWeight={500}>
        {title}
      </Typography>
      <Typography fontSize="1.75rem" fontWeight={700}>
        {match?.number ? `מקצה #${match?.number}` : match?.stage === 'test' ? 'מקצה בדיקה' : '-'}
      </Typography>

      {startTime ? (
        <Countdown
          targetDate={getCountdownTarget(startTime)}
          expiredText="00:00"
          fontFamily={'Roboto Mono'}
          fontSize="3rem"
          fontWeight={700}
          textAlign="center"
        />
      ) : (
        <Grid
          container
          columns={match?.participants.filter(p => p.teamId).length}
          spacing={1}
          mt={2}
        >
          {match &&
            match.participants
              .filter(p => p.teamId)
              .map((participant, index) => {
                const teamJudgingSession = activeSessions?.find(
                  s => s.teamId === participant.teamId
                );
                return (
                  <Grid key={index} xs={1}>
                    <Box
                      sx={{
                        backgroundColor: participant.ready ? green[100] : red[100],
                        border: `1px solid ${participant.ready ? green[300] : red[300]}`,
                        borderRadius: '0.5rem',
                        px: 1.5,
                        py: 0.5
                      }}
                    >
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Stack>
                          <Typography fontWeight={500}>#{participant.team?.number}</Typography>
                          <Typography fontSize="0.875rem" color="text.secondary">
                            {participant.tableName}
                          </Typography>
                        </Stack>
                        {participant.present === 'present' ? (
                          <Tooltip title="הקבוצה על המגרש" arrow>
                            <DoneRoundedIcon />
                          </Tooltip>
                        ) : !participant.team?.registered ? (
                          <Tooltip title="הקבוצה טרם הגיעה לאירוע!" arrow>
                            <CloseRoundedIcon />
                          </Tooltip>
                        ) : teamJudgingSession ? (
                          <Tooltip title="הקבוצה נמצאת בחדר השיפוט כרגע!" arrow>
                            <WarningAmberRoundedIcon />
                          </Tooltip>
                        ) : (
                          <Tooltip title="הקבוצה חסרה" arrow>
                            <RemoveRoundedIcon />
                          </Tooltip>
                        )}
                      </Stack>
                    </Box>
                  </Grid>
                );
              })}
        </Grid>
      )}
    </Paper>
  );
};

export default ActiveMatch;
