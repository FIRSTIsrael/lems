'use client';

import { ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { AudienceDisplayScreen } from '../graphql/types';

interface DisplayModeTransitionProps {
  activeDisplay: AudienceDisplayScreen;
  children: (display: AudienceDisplayScreen) => ReactNode;
}

export const DisplayModeTransition = ({ activeDisplay, children }: DisplayModeTransitionProps) => {
  return (
    <AnimatePresence initial={false}>
      <motion.div
        key={activeDisplay}
        initial={{ opacity: 0, scale: 1.02 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.45, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%'
        }}
      >
        {children(activeDisplay)}
      </motion.div>
    </AnimatePresence>
  );
};
