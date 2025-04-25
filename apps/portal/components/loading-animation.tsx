import React from 'react';
import { CircularProgress, Box } from '@mui/material';

const LoadingAnimation: React.FC = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%'
      }}
    >
      <CircularProgress />
    </Box>
  );
};

export default LoadingAnimation;
