'use client';

import { Box, type SxProps, type Theme } from '@mui/material';
import type { ReactNode } from 'react';

export const pairDividerSx: SxProps<Theme> = {
  borderInlineStartWidth: 2,
  borderInlineStartStyle: 'solid',
  borderInlineStartColor: 'divider'
};

interface TablePairOutlineProps {
  children: ReactNode;
  sx?: SxProps<Theme>;
}

export const TablePairOutline: React.FC<TablePairOutlineProps> = ({ children, sx }) => (
  <Box
    sx={[
      {
        border: 1,
        borderColor: 'divider',
        borderRadius: 1.5,
        p: 0.75,
        display: 'flex',
        gap: 0.75
      },
      ...(Array.isArray(sx) ? sx : [sx])
    ]}
  >
    {children}
  </Box>
);
