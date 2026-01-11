'use client';

import { Checkbox, FormControlLabel, Grid, Stack, Typography } from '@mui/material';
import { RubricCategorySchema } from '@lems/shared/rubrics';

interface RubricExportAwardsProps {
  rubric: {
    data: {
      awards: Record<string, boolean>;
    };
  };
  schema: RubricCategorySchema;
  divisionAwards: Array<{
    id: string;
    name: string;
  }>;
}

export const RubricExportAwards: React.FC<RubricExportAwardsProps> = ({
  rubric,
  schema,
  divisionAwards
}) => {
  if (!schema.awards || divisionAwards.length === 0) {
    return null;
  }

  const rubricAwards = rubric.data?.awards ?? {};

  return (
    <Grid size={4} sx={{ pl: 2 }}>
      <Stack spacing={1}>
        <Typography variant="subtitle2" fontWeight={700}>
          Award Nominations
        </Typography>
        {divisionAwards.map(award => (
          <FormControlLabel
            key={award.id}
            control={<Checkbox checked={rubricAwards[award.id] ?? false} disabled size="small" />}
            label={<Typography variant="body2">{award.name}</Typography>}
          />
        ))}
      </Stack>
    </Grid>
  );
};
