'use client';

import { Paper, Stack } from '@mui/material';
import { StartStopMatchButton } from './start-stop-match-button';
import { LoadMatchButton } from './load-match-button';
import { TestMatchButton } from './test-match-button';

export function ControlButtons() {
  return (
    <Paper sx={{ p: 2, bgcolor: 'background.paper' }}>
      <Stack spacing={1.5}>
        <Stack direction="row" spacing={1}>
          <StartStopMatchButton />
          <LoadMatchButton />
          <TestMatchButton />
        </Stack>
      </Stack>
    </Paper>
  );
}
