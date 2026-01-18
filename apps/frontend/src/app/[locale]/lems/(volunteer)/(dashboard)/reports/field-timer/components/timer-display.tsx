import { Box, Paper } from '@mui/material';
import { Countdown } from '../../../../../../../../lib/time/countdown';

interface TimerDisplayProps {
  targetDate: Date;
  isDesktop: boolean;
}

export function TimerDisplay({ targetDate, isDesktop }: TimerDisplayProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        py: isDesktop ? 8 : 5,
        px: isDesktop ? 8 : 4,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: theme =>
          `linear-gradient(135deg, ${theme.palette.primary.main}14 0%, ${theme.palette.primary.light}08 100%)`,
        borderRadius: 3,
        border: theme => `2px solid ${theme.palette.primary.light}`,
        backdropFilter: 'blur(8px)'
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
            textShadow: theme => `0 4px 12px ${theme.palette.primary.main}30`,
            fontVariantNumeric: 'tabular-nums'
          }}
        />
      </Box>
    </Paper>
  );
}
