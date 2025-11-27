import { WithId } from 'mongodb';
import { Award, DivisionWithEvent, JudgingCategory, Rubric, Team } from '@lems/types';
import Grid from '@mui/material/Grid';
import { Box, Stack } from '@mui/material';
import { rubricsSchemas } from '@lems/season';
import { RubricHeader } from './rubrics/rubric-header';
import { RubricAwards } from './rubrics/rubric-awards';
import { RubricTable } from './rubrics/rubric-table';

interface ExportRubricProps {
  division: WithId<DivisionWithEvent>;
  team: WithId<Team>;
  rubric: WithId<Rubric<JudgingCategory>>;
  awards: Array<WithId<Award>>;
  showFeedback?: boolean;
}

export const ExportRubric: React.FC<ExportRubricProps> = ({
  division,
  team,
  rubric,
  awards,
  showFeedback = true
}) => {
  const schema = rubricsSchemas[rubric.category];

  return (
    <>
      <Box
        component="section"
        sx={{
          pageBreakInside: 'avoid !important',
          breakInside: 'avoid !important',
          position: 'relative',
          boxSizing: 'border-box',
          '@media print': {
            margin: '0',
            padding: '0',
            maxHeight: '100vh',
            overflow: 'hidden'
          }
        }}
      >
        <Stack spacing={0} sx={{ height: '100%' }}>
          <Grid container>
            <RubricHeader
              rubric={rubric}
              schema={schema}
              division={division}
              team={{ number: team.number.toString() }}
            />
            <RubricAwards size={8} rubric={rubric} schema={schema} divisionAwards={awards} />
          </Grid>
          <Box sx={{ flex: 1, minHeight: 0 }}>
            <RubricTable rubric={rubric} showFeedback={showFeedback} />
          </Box>
        </Stack>
      </Box>
      <Box sx={{ '@media print': { pageBreakAfter: 'always' } }} />
    </>
  );
};

export default ExportRubric;
