import { useMemo } from 'react';
import { WithId } from 'mongodb';
import { Paper, Stack, Tooltip, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import { red } from '@mui/material/colors';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import { DivisionSection, Team } from '@lems/types';
import dayjs from 'dayjs';
import useCountdown from '../../hooks/time/use-countdown';
import useStopwatch from '../../hooks/time/use-stopwatch';
interface TeamQueueCardProps {
  team: WithId<Team>;
  location?: string;
  scheduledTime?: Date;
  isBusy?: DivisionSection;
  urgent?: boolean;
  urgencyThresholdMinutes?: number;
}

const TeamQueueCard: React.FC<TeamQueueCardProps> = ({
  team,
  location,
  scheduledTime,
  isBusy,
  urgent = false,
  urgencyThresholdMinutes = -Infinity
}) => {
  const [days, hours, minutes] = useCountdown(scheduledTime ? scheduledTime : new Date());
  const [upDays, upHours, upMinutes] = useStopwatch(scheduledTime ? scheduledTime : new Date());
  const totalMinutes = useMemo(() => days * 60 * 24 + hours * 60 + minutes, [days, hours, minutes]);
  const totalUpMinutes = useMemo(
    () => upDays * 60 * 24 + upHours * 60 + upMinutes,
    [upDays, upHours, upMinutes]
  );
  const isUrgent = useMemo(
    () => urgent || totalMinutes < urgencyThresholdMinutes,
    [totalMinutes, urgencyThresholdMinutes, urgent]
  );

  return (
    <Grid
      container
      component={Paper}
      columns={2}
      py={1}
      px={2}
      mt={1}
      sx={{
        ...(isUrgent && { backgroundColor: red[100], border: `1px solid ${red[400]}` })
      }}
    >
      <Grid size={1}>
        <Typography fontWeight={500} fontSize="1.25rem">
          #{team.number}
        </Typography>
        <Typography fontSize="1rem" color="textSecondary">
          {team.name}
        </Typography>
        <Typography fontSize="1rem" color="textSecondary">
          {team.affiliation.name}, {team.affiliation.city}
        </Typography>
      </Grid>
      <Grid size={1}>
        <Typography fontWeight={500} fontSize="1.25rem">
          {location}
        </Typography>
        <Stack direction="row" spacing={2}>
          {scheduledTime && (
            <Typography fontSize="1rem" color="textSecondary">
              {dayjs(scheduledTime).format('HH:mm')} (
              {totalMinutes >= 0 ? `בעוד ${totalMinutes}` : `לפני ${totalUpMinutes}`} דק&apos;)
            </Typography>
          )}
          {isBusy && (
            <Tooltip
              title={`הקבוצה נמצאת ב${isBusy === 'field' ? 'זירה' : 'חדר השיפוט'} כרגע!`}
              arrow
            >
              <WarningAmberRoundedIcon color="warning" />
            </Tooltip>
          )}
        </Stack>
      </Grid>
    </Grid>
  );
};

export default TeamQueueCard;
