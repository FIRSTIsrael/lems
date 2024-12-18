import { WithId } from 'mongodb';
import { DivisionWithEvent, JudgingCategory, Rubric, Team } from '@lems/types';
import Grid from '@mui/material/Grid2';
import { Box, Stack } from '@mui/material';
import { rubricsSchemas } from '@lems/season';
import { RubricHeader } from './rubrics/rubric-header';
import { RubricAwards } from './rubrics/rubric-awards';
import { RubricTable } from './rubrics/rubric-table';
import { RubricFeedback } from './rubrics/rubric-feedback';

interface ExportRubricProps {
  division: WithId<DivisionWithEvent>;
  team: WithId<Team>;
  rubric: WithId<Rubric<JudgingCategory>>;
  showFeedback?: boolean;
}

export const ExportRubric: React.FC<ExportRubricProps> = ({
  division,
  team,
  rubric,
  showFeedback = true
}) => {
  const schema = rubricsSchemas[rubric.category];

  return (
    <>
      <Box sx={{ pageBreakInside: 'avoid', mt: 0 }}>
        <Box component="section" sx={{ mt: 0, position: 'relative' }}>
          <Stack>
            <Grid container sx={{ mb: 0.5 }}>
              <RubricHeader
                rubric={rubric}
                schema={schema}
                division={division}
                team={{ number: team.number.toString() }}
              />
              <RubricAwards size={8} rubric={rubric} schema={schema} />
              <RubricTable rubric={rubric} />
              {showFeedback && <RubricFeedback rubric={rubric} />}
            </Grid>
          </Stack>
        </Box>
      </Box>
      <Box sx={{ '@media print': { pageBreakBefore: 'always' } }} />
    </>
  );
};

export default ExportRubric;
