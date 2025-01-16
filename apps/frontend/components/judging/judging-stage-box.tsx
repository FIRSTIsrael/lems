import { useMemo } from 'react';
import { Box, LinearProgress, Stack, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import Countdown from '../general/countdown';
import useCountdown from 'apps/frontend/hooks/use-countdown';

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
  let barColor: 'primary' | 'error' = 'primary';
  let barProgress: number = 0;
  if (targetDate) {
    const [, , minutes, seconds] = useCountdown(targetDate);

    const stageSeconds: number = useMemo(() => {
      return stageDuration - (minutes * 60 + seconds);
    }, [minutes, seconds]);

    ({ barColor, barProgress } = useMemo(() => {
      const stageProgress = 100 - (stageSeconds / stageDuration) * 100;

      return { barColor: stageProgress <= 20 ? 'error' : 'primary', barProgress: stageProgress };
    }, [stageDuration, stageSeconds]));
  }

  return (
    <Stack
      spacing={4}
      direction="row"
      component={Box}
      borderRadius={2}
      bgcolor={targetDate ? '#e3effb' : '#f0f4f8'}
      alignItems="center"
      p={3}
      flexGrow={1}
    >
      <Box borderRadius="50%" width={52} height={52} bgcolor={iconColor} />
      <Grid container flexGrow={1}>
        <Grid size={8}>
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
              fontSize="2.5rem"
              fontWeight={700}
              dir="ltr"
              ml="auto"
              flexGrow={1}
              expiredText=""
            />
          )}
        </Grid>
        {targetDate && (
          <Grid size={12} display="flex" justifyContent="center">
            <LinearProgress
              variant="determinate"
              value={barProgress}
              color={barColor}
              sx={{ width: '100%', borderRadius: 16, height: 8 }}
            />
          </Grid>
        )}
      </Grid>
    </Stack>
  );
};

export default JudgingStageBox;
