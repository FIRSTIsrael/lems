'use client';

import { useCallback, useMemo } from 'react';
import {
  Box,
  Stack,
  Typography,
  Button,
  useMediaQuery,
  useTheme,
  LinearProgress,
  Paper,
  Grid
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { Close as CloseIcon } from '@mui/icons-material';
import { useJudgingSessionStageTranslations } from '@lems/localization';
import { TeamInfo } from '../../../components/team-info';
import { JudgingSession } from '../../judge.graphql';
import {
  formatTime,
  getStageColor,
  JUDGING_STAGES,
  useJudgingSessionTimer
} from './hooks/use-judging-session-timer';
import { StageTimeline } from './stage-timeline';

interface JudgingSessionTimerDisplayProps {
  session: JudgingSession;
}

export const JudgingSessionTimerDisplay: React.FC<JudgingSessionTimerDisplayProps> = ({
  session
}) => {
  const t = useTranslations('pages.judge');
  const { getStage } = useJudgingSessionStageTranslations();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));

  const { timerState } = useJudgingSessionTimer(session.startTime);
  const { currentStageIndex, stageTimeRemaining, totalTimeRemaining } = timerState;

  const currentStage = JUDGING_STAGES[currentStageIndex];
  const stageColor = getStageColor(currentStage.id);

  // Calculate stage progress for the main progress bar
  const stageProgress = useMemo(
    () => ((currentStage.duration - stageTimeRemaining) / currentStage.duration) * 100,
    [currentStage.duration, stageTimeRemaining]
  );

  const handleAbortSession = useCallback(() => {
    // Abort functionality to be implemented
  }, []);

  if (isMobile) {
    // Mobile full-screen timer view
    return (
      <Box
        sx={{
          width: '100%',
          height: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#f5f5f5',
          p: 2
        }}
      >
        <Stack
          component={Paper}
          spacing={3}
          sx={{
            py: 4,
            px: 3,
            width: '100%',
            maxWidth: 500,
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
            borderRadius: 3
          }}
        >
          {/* Top Section - Current Stage */}
          <Box p={2}>
            <Typography
              variant="overline"
              sx={{
                fontWeight: 600,
                color: 'text.secondary',
                fontSize: '0.7rem',
                letterSpacing: 1.2,
                textTransform: 'uppercase',
                display: 'block'
              }}
            >
              {t('timer.current-stage')}
            </Typography>
            <Stack direction="row" spacing={1.5} alignItems="center" mt={1}>
              <Box
                sx={{
                  width: 5,
                  height: 36,
                  borderRadius: 2,
                  backgroundColor: stageColor
                }}
              />
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 600,
                  fontSize: '1.5rem',
                  letterSpacing: 0.5
                }}
              >
                {getStage(currentStage.id)}
              </Typography>
            </Stack>
          </Box>

          {/* Main Timer - Centered and Prominent */}
          <Box textAlign="center">
            <Typography
              sx={{
                fontSize: '7rem',
                fontWeight: 700,
                fontFamily: 'monospace',
                lineHeight: 0.9,
                dir: 'ltr',
                color: 'text.primary'
              }}
            >
              {formatTime(stageTimeRemaining)}
            </Typography>

            {/* Stage Progress Bar - Sleek and minimal */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2.5 }}>
              <LinearProgress
                variant="determinate"
                value={stageProgress}
                color={stageProgress !== 0 ? 'primary' : 'error'}
                sx={{
                  width: '80%',
                  borderRadius: 2,
                  height: 8,
                  backgroundColor: 'rgba(0, 0, 0, 0.06)'
                }}
              />
            </Box>
          </Box>

          {/* Bottom Section - Team Info and Session Details */}
          <Stack spacing={2}>
            {/* Team Info */}
            <Box
              sx={{
                p: 2,
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
                  fontSize: '0.7rem',
                  letterSpacing: 1.2,
                  textTransform: 'uppercase',
                  mb: 1.5,
                  display: 'block'
                }}
              >
                {t('timer.team')}
              </Typography>
              <Box sx={{ pl: 0.5 }}>
                <TeamInfo team={session.team} size="sm" />
              </Box>
            </Box>

            {/* Session End Countdown */}
            <Box
              sx={{
                p: 2,
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
                  fontSize: '0.7rem',
                  letterSpacing: 1.2,
                  textTransform: 'uppercase',
                  mb: 1,
                  display: 'block'
                }}
              >
                {t('timer.session-ends-in-label')}
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 600,
                  fontSize: '1.5rem',
                  fontFamily: 'monospace',
                  color: 'text.primary',
                  pl: 0.5
                }}
              >
                {formatTime(totalTimeRemaining)}
              </Typography>
            </Box>

            {/* Abort Button */}
            <Button
              variant="outlined"
              color="error"
              disabled
              startIcon={<CloseIcon />}
              fullWidth
              sx={{
                textTransform: 'none',
                fontSize: '0.875rem',
                fontWeight: 600,
                borderWidth: 1.5,
                height: 48,
                '&:hover': {
                  borderWidth: 1.5
                }
              }}
            >
              {t('abort-session')}
            </Button>
          </Stack>
        </Stack>
      </Box>
    );
  }

  // Desktop/tablet view with sidebar
  return (
    <Grid container spacing={3}>
      {/* Left Panel - Stage Timeline (hidden on tablet) */}
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

      {/* Main Content */}
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
          {/* Top Section - Current Stage */}
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
              {t('timer.current-stage')}
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

          {/* Main Timer - Centered and Prominent */}
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

            {/* Stage Progress Bar - Sleek and minimal */}
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

          {/* Bottom Section - Team Info and Session Details */}
          <Stack spacing={2}>
            {/* Team Info */}
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
                {t('timer.team')}
              </Typography>
              <Box sx={{ pl: 0.5 }}>
                <TeamInfo team={session.team} size="lg" />
              </Box>
            </Box>

            {/* Session End Countdown & Abort Button */}
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
                  {t('timer.session-ends-in-label')}
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

              {/* Abort Button - Aligned with frame */}
              <Button
                variant="outlined"
                color="error"
                disabled
                startIcon={<CloseIcon />}
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
