'use client';

import { Box } from '@mui/material';
import type { ReactNode } from 'react';

/** Rich-text tags for FIRST® LEGO® League sponsor titles. */
export const firstTitleTags = {
  first: (chunks: ReactNode) => (
    <Box component="em" sx={{ fontStyle: 'italic' }}>
      {chunks}
    </Box>
  ),
  reg: (chunks: ReactNode) => <sup>{chunks}</sup>
} as const;
