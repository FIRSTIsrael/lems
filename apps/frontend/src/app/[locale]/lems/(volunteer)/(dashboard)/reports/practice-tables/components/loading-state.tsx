import { Paper, CircularProgress, Stack } from '@mui/material';

export const LoadingState: React.FC = () => {
  return (
    <Paper
      sx={{
        p: 6,
        textAlign: 'center'
      }}
    >
      <Stack sx={{ alignItems: 'center' }}>
        <CircularProgress />
      </Stack>
    </Paper>
  );
};
