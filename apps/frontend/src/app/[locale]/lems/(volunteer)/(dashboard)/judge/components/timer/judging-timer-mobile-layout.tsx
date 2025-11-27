'use client';

import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import { Close } from '@mui/icons-material';
import { Box, Button, Stack, Paper, Typography, LinearProgress } from '@mui/material';
import { useJudgingSessionStageTranslations } from '@lems/localization';
import { TeamInfo } from '../../../components/team-info';
import { AbortSessionDialog } from './abort-session-dialog';
import {
  formatTime,
  getStageColor,
  JUDGING_STAGES,
  useJudgingSessionTimer
} from './hooks/use-judging-timer';
import { useSession } from './judging-session-context';

interface JudgingTimerMobileLayoutProps {
  onAbortSession: (sessionId: string) => void;
}

export const JudgingTimerMobileLayout: React.FC<JudgingTimerMobileLayoutProps> = ({
  onAbortSession
}) => {
  const t = useTranslations('pages.judge.timer');

  const [abortDialogOpen, setAbortDialogOpen] = useState(false);

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
            {t('current-stage')}
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

        <Stack spacing={2}>
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
              {t('team')}
            </Typography>
            <Box sx={{ pl: 0.5 }}>
              <TeamInfo team={session.team} size="sm" />
            </Box>
          </Box>

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
              {t('session-ends-in-label')}
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

          <Button
            variant="outlined"
            color="error"
            onClick={() => setAbortDialogOpen(true)}
            startIcon={<Close />}
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

      <AbortSessionDialog
        open={abortDialogOpen}
        onClose={() => setAbortDialogOpen(false)}
        onConfirm={() => onAbortSession(session.id)}
      />
    </Box>
  );
};
