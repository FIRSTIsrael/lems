'use client';

import { Box, type SxProps, type Theme } from '@mui/material';
import type { ReactNode } from 'react';

// A plain style object (not an array/function) so it can be an element of an sx array.
export const pairDividerSx: Exclude<
  SxProps<Theme>,
  ReadonlyArray<unknown> | ((theme: Theme) => unknown)
> = {
  borderInlineStartWidth: 2,
  borderInlineStartStyle: 'solid',
  borderInlineStartColor: theme => theme.palette.divider
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
