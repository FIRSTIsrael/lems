'use client';

import { Stack } from '@mui/material';
import { AnimatePresence, motion } from 'motion/react';
import JudgingStageBox from './judging-stage-box';

interface JudgingStage {
  duration: number;
  primaryText: string;
  iconColor: string;
  id: number;
  secondaryText?: string;
}

interface TimedJudgingStage extends JudgingStage {
  startTime: Date;
  endTime: Date;
}

interface JudgingStagesSidebarProps {
  stagesToDisplay: TimedJudgingStage[];
  currentStage: TimedJudgingStage | null;
}

const STAGE_HEIGHT = 105;

export const JudgingStagesSidebar: React.FC<JudgingStagesSidebarProps> = ({
  stagesToDisplay,
  currentStage
}) => {
  return (
    <Stack spacing={3} height={STAGE_HEIGHT * 4}>
      <AnimatePresence>
        {stagesToDisplay.map(stage => (
          <motion.div
            key={stage.id}
            variants={{
              enter: {
                opacity: 0,
                y: 50,
                height: 0
              },
              move: { opacity: 1, y: 0, height: STAGE_HEIGHT },
              leave: { opacity: 0, y: -50, height: 0 }
            }}
            initial="enter"
            exit="leave"
            animate="move"
            transition={{ duration: 0.4 }}
            style={{ borderRadius: '16px' }}
          >
            <JudgingStageBox
              primaryText={stage.primaryText}
              secondaryText={stage.secondaryText}
              iconColor={stage.iconColor}
              stageDuration={stage.duration}
              targetDate={stage.id === currentStage?.id ? stage.endTime : undefined}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </Stack>
  );
};

