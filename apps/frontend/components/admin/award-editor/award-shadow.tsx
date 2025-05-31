import React from 'react';
import { Paper } from '@mui/material';

interface AwardShadowProps {
  dragging: DOMRect;
}

/**
 * Component to display a shadow placeholder during drag operations
 */
const AwardShadow: React.FC<AwardShadowProps> = ({ dragging }) => {
  return (
    <Paper
      sx={{
        height: dragging.height,
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        border: '2px dashed rgba(0, 0, 0, 0.2)',
        marginY: 1
      }}
      elevation={0}
    />
  );
};

export default AwardShadow;
