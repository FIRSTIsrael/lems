'use client';

import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import { Close } from '@mui/icons-material';
import {
  Box,
  Button,
  Stack,
  Grid,
  Typography,
  LinearProgress,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { useJudgingSessionStageTranslations } from '@lems/localization';
import { TeamInfo } from '../../../components/team-info';
import {
  formatTime,
  getStageColor,
  JUDGING_STAGES,
  useJudgingSessionTimer
} from './hooks/use-judging-timer';
import { StageTimeline } from './stage-timeline';
import { useSession } from './judging-session-context';

export const JudgingTimerDesktopLayout: React.FC = () => {
  const t = useTranslations('pages.judge.timer');
  const theme = useTheme();
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));

  const { session, sessionLength } = useSession();
  const { getStage } = useJudgingSessionStageTranslations();
  const { timerState } = useJudgingSessionTimer(session.startTime!, sessionLength);
  const { currentStageIndex, stageTimeRemaining, totalTimeRemaining } = timerState;

  const currentStage = JUDGING_STAGES[currentStageIndex];
  const stageColor = getStageColor(currentStage.id);

  // Calculate stage progress for the main progress bar
  const stageProgress = useMemo(
    () => ((currentStage.duration - stageTimeRemaining) / currentStage.duration) * 100,
    [currentStage.duration, stageTimeRemaining]
  );

  return (
    <Grid container spacing={3}>
      {!isTablet && (
        <Grid
          size={4}
          sx={{
            p: 3,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 4px 24px 0 rgba(31, 38, 135, 0.12)',
            borderRadius: 3,
            overflowY: 'auto'
          }}
        >
          <StageTimeline timerState={timerState} />
        </Grid>
      )}

      <Grid
        size={{ md: 12, lg: 8 }}
        sx={{
          py: 6,
          px: isTablet ? 3 : 5,
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
          borderRadius: 3,
          width: '100%'
        }}
      >
        <Stack spacing={4} height="100%" justifyContent="space-between">
          <Box p={2.5}>
            <Typography
              variant="overline"
              sx={{
                fontWeight: 600,
                color: 'text.secondary',
                fontSize: '0.75rem',
                letterSpacing: 1.2,
                textTransform: 'uppercase'
              }}
            >
              {t('current-stage')}
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center" mt={1}>
              <Box
                sx={{
                  width: 6,
                  height: 48,
                  borderRadius: 3,
                  backgroundColor: stageColor
                }}
              />
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 600,
                  fontSize: isTablet ? '1.75rem' : '2.25rem',
                  letterSpacing: 0.5
                }}
              >
                {getStage(currentStage.id)}
              </Typography>
            </Stack>
          </Box>

          <Box textAlign="center">
            <Typography
              sx={{
                fontSize: isTablet ? '10rem' : '14rem',
                fontWeight: 700,
                fontFamily: 'monospace',
                lineHeight: 0.9,
                dir: 'ltr',
                color: 'text.primary'
              }}
            >
              {formatTime(stageTimeRemaining)}
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <LinearProgress
                variant="determinate"
                value={stageProgress}
                color={stageProgress !== 0 ? 'primary' : 'error'}
                sx={{
                  width: '60%',
                  borderRadius: 2,
                  height: 8,
                  backgroundColor: 'rgba(0, 0, 0, 0.06)'
                }}
              />
            </Box>
          </Box>

          <Stack spacing={2}>
            <Box
              sx={{
                p: 2.5,
                bgcolor: 'grey.50',
                border: '1px solid',
                borderColor: 'grey.200',
                borderRadius: 2
              }}
            >
              <Typography
                variant="overline"
                sx={{
                  fontWeight: 600,
                  color: 'text.secondary',
                  fontSize: '0.75rem',
                  letterSpacing: 1.2,
                  textTransform: 'uppercase',
                  mb: 1.5,
                  display: 'block'
                }}
              >
                {t('team')}
              </Typography>
              <Box sx={{ pl: 0.5 }}>
                <TeamInfo team={session.team} size="lg" />
              </Box>
            </Box>

            <Stack direction="row" spacing={2} alignItems="flex-end">
              <Box
                sx={{
                  flex: 1,
                  p: 2.5,
                  bgcolor: 'grey.50',
                  border: '1px solid',
                  borderColor: 'grey.200',
                  borderRadius: 2
                }}
              >
                <Typography
                  variant="overline"
                  sx={{
                    fontWeight: 600,
                    color: 'text.secondary',
                    fontSize: '0.75rem',
                    letterSpacing: 1.2,
                    textTransform: 'uppercase',
                    mb: 1,
                    display: 'block'
                  }}
                >
                  {t('session-ends-in-label')}
                </Typography>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 600,
                    fontSize: isTablet ? '1.5rem' : '2rem',
                    fontFamily: 'monospace',
                    color: 'text.primary',
                    pl: 0.5
                  }}
                >
                  {formatTime(totalTimeRemaining)}
                </Typography>
              </Box>

              <Button
                variant="outlined"
                color="error"
                disabled
                startIcon={<Close />}
                sx={{
                  textTransform: 'none',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  borderWidth: 1.5,
                  height: 56,
                  px: 3,
                  '&:hover': {
                    borderWidth: 1.5
                  }
                }}
              >
                {t('abort-session')}
              </Button>
            </Stack>
          </Stack>
        </Stack>
      </Grid>
    </Grid>
  );
};
