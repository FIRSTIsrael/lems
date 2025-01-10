import dayjs from 'dayjs';
import { WithId } from 'mongodb';
import { Box, Paper, Tooltip, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { green, red } from '@mui/material/colors';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import RemoveRoundedIcon from '@mui/icons-material/RemoveRounded';
import DoneRoundedIcon from '@mui/icons-material/DoneRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import { JudgingSession, MATCH_LENGTH, RobotGameMatch } from '@lems/types';
import Countdown from '../../general/countdown';

interface ActiveMatchProps {
  title: React.ReactNode;
  match: WithId<RobotGameMatch> | null;
  startTime?: Date;
  sessions?: Array<WithId<JudgingSession>>;
  showDelay?: boolean;
}

const ActiveMatch: React.FC<ActiveMatchProps> = ({
  title,
  match,
  startTime,
  sessions = [],
  showDelay = false
}) => {
  const getCountdownTarget = (startTime: Date) =>
    dayjs(startTime).add(MATCH_LENGTH, 'seconds').toDate();

  return (
    <Paper sx={{ p: 2, flex: 1 }}>
      <Box display="flex" justifyContent="space-between">
        <Typography component="h2" fontSize="1.125rem" fontWeight={500}>
          {title}
        </Typography>
        {showDelay && match?.status == 'not-started' && match?.scheduledTime && (
          <Countdown
            targetDate={match.scheduledTime}
            allowNegativeValues={true}
            fontSize="1.1rem"
            fontWeight={500}
            dir="ltr"
          />
        )}
      </Box>
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
          columnSpacing={1.5}
          mt={2}
        >
          {match &&
            match.participants
              .filter(p => p.teamId)
              .map((participant, index) => {
                const teamInJudging = sessions
                  .filter(
                    s =>
                      s.status === 'in-progress' ||
                      (s.status === 'not-started' && s.called && s.queued)
                  )
                  .find(s => s.teamId === participant.teamId);
                return (
                  <Grid
                    key={index}
                    size={1}
                    sx={{
                      backgroundColor: participant.ready ? green[100] : red[100],
                      border: `1px solid ${participant.ready ? green[300] : red[300]}`,
                      borderRadius: '0.5rem',
                      height: '100%'
                    }}
                  >
                    <Grid container spacing={1} columns={2} px={2} py={1}>
                      <Grid size={1}>
                        <Typography fontWeight={500}>#{participant.team?.number}</Typography>
                        <Typography fontSize="0.875rem" color="textSecondary">
                          {participant.tableName}
                        </Typography>
                      </Grid>
                      <Grid alignItems="center" display="flex" size={1}>
                        {participant.present === 'present' ? (
                          <Tooltip title="הקבוצה על המגרש" arrow>
                            <DoneRoundedIcon />
                          </Tooltip>
                        ) : participant.queued ? (
                          <Tooltip title="הקבוצה בקיו" arrow>
                            <PeopleAltRoundedIcon />
                          </Tooltip>
                        ) : !participant.team?.registered ? (
                          <Tooltip title="הקבוצה טרם הגיעה לאירוע!" arrow>
                            <CloseRoundedIcon />
                          </Tooltip>
                        ) : teamInJudging ? (
                          <Tooltip title="הקבוצה נמצאת בחדר השיפוט כרגע!" arrow>
                            <WarningAmberRoundedIcon />
                          </Tooltip>
                        ) : (
                          <Tooltip title="הקבוצה חסרה" arrow>
                            <RemoveRoundedIcon />
                          </Tooltip>
                        )}
                      </Grid>
                    </Grid>
                  </Grid>
                );
              })}
        </Grid>
      )}
    </Paper>
  );
};

export default ActiveMatch;
