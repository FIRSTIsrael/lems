import { Box, Paper } from '@mui/material';
import { Countdown } from '../../../../../../../../lib/time/countdown';

interface TimerDisplayProps {
  targetDate: Date;
  isDesktop: boolean;
}

export function TimerDisplay({ targetDate, isDesktop }: TimerDisplayProps) {
  return (
    <Paper
      elevation={3}
      sx={{
        py: isDesktop ? 8 : 4,
        px: isDesktop ? 6 : 3,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: theme =>
          `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.grey[50]} 100%)`,
        borderRadius: 4
      }}
    >
      <Box
        sx={{
          textAlign: 'center',
          width: '100%'
        }}
      >
        <Countdown
          targetDate={targetDate}
          expiredText="00:00"
          fontFamily="monospace"
          fontSize={isDesktop ? '15rem' : '8rem'}
          fontWeight={700}
          letterSpacing="-0.02em"
          sx={{
            color: theme => theme.palette.primary.main,
            textShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}
        />
      </Box>
    </Paper>
  );
}
