import { LinearProgress, Box } from '@mui/material';

interface ProgressBarProps {
  percentRemaining: number;
}

export function ProgressBar({ percentRemaining }: ProgressBarProps) {
  const isWarning = percentRemaining <= 20;

  return (
    <Box sx={{ mt: -2 }}>
      <LinearProgress
        variant="determinate"
        value={percentRemaining}
        color={isWarning ? 'error' : 'primary'}
        sx={{
          height: 48,
          borderBottomLeftRadius: 8,
          borderBottomRightRadius: 8,
          '& .MuiLinearProgress-bar': {
            transition: 'transform 0.4s linear, background-color 0.3s ease'
          }
        }}
      />
    </Box>
  );
}
