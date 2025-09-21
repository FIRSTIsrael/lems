'use client';

import { Grid } from '@mui/material';
import { AwardsList } from './awards-list';
import { AwardsValidation } from './awards-validation';
import { AwardsHeader } from './awards-header';

export function AwardsEditor() {
  return (
    <>
      <AwardsHeader />

      <Grid container spacing={3}>
        <Grid size={8}>
          <AwardsList />
        </Grid>
        <Grid size={4}>
          <AwardsValidation />
        </Grid>
      </Grid>
    </>
  );
}
