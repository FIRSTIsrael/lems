import React from 'react';
import { WithId } from 'mongodb';
import { Box, Stack } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { rubricsSchemas } from '@lems/season';
import { Rubric, JudgingCategory, DivisionWithEvent, Team } from '@lems/types';
import { RubricAwards } from './rubrics/rubric-awards';
import { SessionFeedbackHeader } from './rubrics/feedback-page/session-feedback-header';
import SessionFeedbackTable from './rubrics/feedback-page/session-feedback-table';

interface ExportRubricFeedbackProps {
  rubrics: Array<WithId<Rubric<JudgingCategory>>>;
  division: WithId<DivisionWithEvent>;
  team: WithId<Team>;
}

export const ExportRubricFeedback: React.FC<ExportRubricFeedbackProps> = ({
  rubrics,
  division,
  team
}) => {
  const cvrubric = rubrics.find(r => r.category === 'core-values');
  if (!cvrubric) return null;

  return (
    <Box sx={{ pageBreakInside: 'avoid', mt: 0 }}>
      <Box component="section" sx={{ mt: 0, position: 'relative' }}>
        <Stack>
          <Grid container sx={{ mb: 0.5 }}>
            <SessionFeedbackHeader rubric={cvrubric} division={division} team={team} />
            <SessionFeedbackTable rubrics={rubrics} />
            <RubricAwards rubric={cvrubric} schema={rubricsSchemas[cvrubric.category]} size={12} />
          </Grid>
        </Stack>
      </Box>
    </Box>
  );
};

export default ExportRubricFeedback;
