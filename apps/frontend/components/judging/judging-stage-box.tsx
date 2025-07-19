import { useMemo } from 'react';
import { Box, LinearProgress, Stack, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import Countdown from '../general/countdown';
import useCountdown from '../../hooks/time/use-countdown';

interface JudgingStageProgressProps {
  stageDuration: number;
  targetDate: Date;
}

const JudgingStageProgress: React.FC<JudgingStageProgressProps> = ({
  stageDuration,
  targetDate
}) => {
  let barColor: 'primary' | 'error' = 'primary';
  let barProgress = 0;
  const [, , minutes, seconds] = useCountdown(targetDate);

  const stageSeconds: number = useMemo(() => {
    return stageDuration - (minutes * 60 + seconds);
  }, [minutes, seconds, stageDuration]);

  ({ barColor, barProgress } = useMemo(() => {
    const stageProgress = 100 - (stageSeconds / stageDuration) * 100;

    return { barColor: stageProgress <= 20 ? 'error' : 'primary', barProgress: stageProgress };
  }, [stageDuration, stageSeconds]));
  return (
    <Grid size={12} display="flex" justifyContent="center" mt={1}>
      <LinearProgress
        variant="determinate"
        value={barProgress}
        color={barColor}
        sx={{ width: '100%', borderRadius: 16, height: 8 }}
      />
    </Grid>
  );
};

interface JudgingStageBoxProps {
  primaryText: string;
  secondaryText?: string;
  iconColor: string;
  stageDuration: number;
  targetDate?: Date;
}

const JudgingStageBox: React.FC<JudgingStageBoxProps> = ({
  primaryText,
  secondaryText,
  iconColor,
  stageDuration,
  targetDate
}) => {
  return (
    <Stack
      spacing={4}
      direction="row"
      component={Box}
      borderRadius={2}
      bgcolor={targetDate ? '#e3effb' : '#f0f4f8'}
      alignItems="center"
      p={3}
      height="100%"
    >
      <Box borderRadius="50%" minWidth={52} minHeight={52} bgcolor={iconColor} />
      <Grid container width="100%" justifyContent="flex-start">
        <Grid size={8} display="flex" alignItems="center">
          <Typography>
            <Typography fontSize="1.25rem" fontWeight={600}>
              {primaryText}
            </Typography>
            <Typography fontSize="0.875rem">{secondaryText}</Typography>
          </Typography>
        </Grid>
        <Grid size={4}>
          {targetDate && (
            <Countdown
              targetDate={targetDate}
              fontFamily="Roboto Mono"
              fontSize="1.75rem"
              fontWeight={700}
              dir="ltr"
              ml="auto"
              flexGrow={1}
              expiredText="00:00"
            />
          )}
        </Grid>
        {targetDate && (
          <JudgingStageProgress stageDuration={stageDuration} targetDate={targetDate} />
        )}
      </Grid>
    </Stack>
  );
};

export default JudgingStageBox;
