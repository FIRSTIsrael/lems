'use client';

import React from 'react';
import { Box } from '@mui/material';

interface ResizeHandlesProps {
  onMouseDownTopEdge: (e: React.MouseEvent) => void;
  onMouseDownBottomEdge: (e: React.MouseEvent) => void;
}

export const ResizeHandles: React.FC<ResizeHandlesProps> = ({
  onMouseDownTopEdge,
  onMouseDownBottomEdge
}) => {
  return (
    <>
      <Box
        onMouseDown={onMouseDownTopEdge}
        sx={{
          position: 'absolute',
          top: -4,
          left: 0,
          right: 0,
          height: 8,
          cursor: 'ns-resize',
          zIndex: 10,
          '&:hover': {
            backgroundColor: 'rgba(0,0,0,0.2)'
          }
        }}
      />

      <Box
        onMouseDown={onMouseDownBottomEdge}
        sx={{
          position: 'absolute',
          bottom: -4,
          left: 0,
          right: 0,
          height: 8,
          cursor: 'ns-resize',
          zIndex: 10,
          '&:hover': {
            backgroundColor: 'rgba(0,0,0,0.2)'
          }
        }}
      />
    </>
  );
};
