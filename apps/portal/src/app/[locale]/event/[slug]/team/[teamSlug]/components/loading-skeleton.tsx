import { Paper, Box, Skeleton } from '@mui/material';

export const LoadingSkeleton = () => {
  return (
    <Paper sx={{ p: 0 }}>
      <Box sx={{ p: 3, pb: 0 }}>
        <Skeleton variant="text" width="30%" height={40} />
      </Box>

      <Paper sx={{ p: 2, bgcolor: 'white', mt: 2 }}>
        <Skeleton variant="rounded" width="100%" height={80} />
      </Paper>
    </Paper>
  );
};
