'use client';

import { Box } from '@mui/material';
import { ResponsiveComponent } from '@lems/shared';
import { NoMatchState } from './no-match-state';
import { ActiveMatchState } from './active-match-state';
import { useFieldTimer } from './field-timer-context';

function ContentDesktop() {
  const { activeMatch } = useFieldTimer();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 'calc(100vh - 24px)',
        px: 4,
        py: 6
      }}
    >
      {activeMatch === null ? <NoMatchState isDesktop /> : <ActiveMatchState isDesktop />}
    </Box>
  );
}

function ContentMobile() {
  const { activeMatch } = useFieldTimer();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 'calc(100vh - 24px)',
        px: 2,
        py: 3
      }}
    >
      {activeMatch === null ? (
        <NoMatchState isDesktop={false} />
      ) : (
        <ActiveMatchState isDesktop={false} />
      )}
    </Box>
  );
}

export function TimerContent() {
  return <ResponsiveComponent desktop={<ContentDesktop />} mobile={<ContentMobile />} />;
}
