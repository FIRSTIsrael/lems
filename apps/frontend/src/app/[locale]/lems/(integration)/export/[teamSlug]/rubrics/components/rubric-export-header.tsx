'use client';

import { Grid, Stack, Typography } from '@mui/material';
import { RubricCategorySchema } from '@lems/shared/rubrics';
import { JudgingCategory } from '@lems/types/judging';
import { useJudgingCategoryTranslations } from '@lems/localization';

interface RubricExportHeaderProps {
  rubric: {
    id: string;
    category: JudgingCategory;
  };
  schema: RubricCategorySchema;
  team: {
    number: number;
  };
  divisionName: string;
}

export const RubricExportHeader: React.FC<RubricExportHeaderProps> = ({
  rubric,
  schema,
  team,
  divisionName
}) => {
  const { getCategory } = useJudgingCategoryTranslations();
  const hasAwards = schema.awards;

  return (
    <>
      <Grid size={hasAwards ? 8 : 10}>
        <Stack justifyContent="space-between" height="100%" spacing={0.5}>
          <Typography variant="caption" color="textSecondary">
            Generated from FIRST Israel Event System ({rubric.id}) | {divisionName}
          </Typography>
          <Typography variant="h6" fontWeight={700}>
            {getCategory(rubric.category)} Rubric - Team #{team.number}
          </Typography>
        </Stack>
      </Grid>
      <Grid size={hasAwards ? 4 : 2}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt="FIRST LEGO League Challenge Logo"
          src="/assets/fllc-logo.svg"
          style={{ maxWidth: '100%', height: 'auto' }}
        />
      </Grid>
    </>
  );
};
