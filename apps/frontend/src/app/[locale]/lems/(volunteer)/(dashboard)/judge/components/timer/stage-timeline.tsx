'use client';

import { Stack, Typography } from '@mui/material';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslations } from 'next-intl';
import { useJudgingSessionStageTranslations } from '@lems/localization';
import {
  JUDGING_STAGES,
  formatTime,
  getStageColor,
  JudgingSessionTimerState
} from './hooks/use-judging-session-timer';

interface StageTimelineProps {
  timerState: JudgingSessionTimerState;
}

export const StageTimeline = ({ timerState }: StageTimelineProps) => {
  const t = useTranslations('pages.judge');
  const { getStage } = useJudgingSessionStageTranslations();
  const { currentStageIndex, stageTimeRemaining } = timerState;

  const nextStageIndex = currentStageIndex + 1;
  const hasNextStage = nextStageIndex < JUDGING_STAGES.length;

  return (
    <Stack spacing={2}>
      <AnimatePresence mode="popLayout">
        {JUDGING_STAGES.map((stage, displayIndex) => {
          const actualIndex = currentStageIndex + displayIndex;
          const isActive = actualIndex === currentStageIndex;
          const isNext = actualIndex === nextStageIndex;
          const color = getStageColor(stage.id);

          return (
            <motion.div
              key={stage.id}
              initial={{ opacity: 0, x: -16, height: 0 }}
              animate={{ opacity: 1, x: 0, height: 'auto' }}
              exit={{ opacity: 0, x: -16, height: 0 }}
              transition={{ duration: 0.25 }}
              layout
            >
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                p={2}
                sx={{
                  borderLeft: `4px solid ${color}`,
                  backgroundColor: isActive ? `${color}12` : '#fafafa',
                  borderRadius: 1,
                  transition: 'all 0.2s ease',
                  position: 'relative'
                }}
              >
                <Stack spacing={0.5} flex={1} mr={1}>
                  <Typography
                    variant="body1"
                    sx={{
                      fontWeight: isActive ? 700 : 600,
                      color: isActive ? color : 'text.primary',
                      fontSize: '1rem'
                    }}
                  >
                    {getStage(stage.id)}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 500,
                      color: 'text.secondary',
                      fontSize: '0.85rem'
                    }}
                  >
                    {t('timer.minutes', { count: stage.duration / 60 })}
                  </Typography>
                </Stack>
                <Stack spacing={0.5} alignItems="flex-end">
                  <Typography
                    sx={{
                      fontSize: '1rem',
                      fontWeight: 700,
                      color: color,
                      fontFamily: 'monospace',
                      flexShrink: 0
                    }}
                  >
                    {isActive ? formatTime(stageTimeRemaining) : formatTime(stage.duration)}
                  </Typography>
                  {isNext && hasNextStage && (
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 600,
                        color: 'text.secondary',
                        fontSize: '0.7rem',
                        letterSpacing: 0.5,
                        backgroundColor: 'rgba(0, 0, 0, 0.05)',
                        px: 1,
                        py: 0.25,
                        borderRadius: 0.5
                      }}
                    >
                      {t('timer.up-next')}
                    </Typography>
                  )}
                </Stack>
              </Stack>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </Stack>
  );
};
