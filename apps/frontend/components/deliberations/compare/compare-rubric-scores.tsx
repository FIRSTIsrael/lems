import { useContext } from 'react';
import { ObjectId } from 'mongodb';
import Grid from '@mui/material/Unstable_Grid2';
import { green, red, yellow } from '@mui/material/colors';
import { Stack, Typography } from '@mui/material';
import { JudgingCategory } from '@lems/types';
import { rubricsSchemas } from '@lems/season';
import { CompareContext } from './compare-view';

interface CompareRubricScoresProps {
  teamId: ObjectId;
}

const CompareRubricScores: React.FC<CompareRubricScoresProps> = ({ teamId }) => {
  const { rubrics, category } = useContext(CompareContext);
  let teamRubrics = rubrics.filter(rubric => rubric.teamId === teamId);
  let competitorRubrics = rubrics.filter(r => r.teamId !== teamId);

  if (category) {
    competitorRubrics = competitorRubrics.filter(r => r.category === category);
    teamRubrics = teamRubrics.filter(r => r.category === category);
  }

  return teamRubrics.map(rubric => {
    const schema = rubricsSchemas[rubric.category];
    const localizationMap = schema.sections
      .flatMap(section => section.fields)
      .reduce(
        (acc, field) => {
          acc[field.id] = field.title;
          return acc;
        },
        {} as Record<string, string>
      );

    return (
      <Grid container>
        {Object.entries(rubric.data?.values ?? {}).map(([clauseName, value]) => {
          let color;
          const highestScore = Math.max(
            ...competitorRubrics.map(r => r.data?.values?.[clauseName]?.value ?? -1)
          );
          if (value.value > highestScore) {
            color = green[500];
          } else if (value.value < highestScore) {
            color = red[500];
          } else {
            color = yellow[500];
          }

          return (
            <Grid xs={6}>
              <Stack direction="row">
                <Typography>{localizationMap[clauseName]}:</Typography>
                <Typography color={color}>{value.value}</Typography>
              </Stack>
            </Grid>
          );
        })}
      </Grid>
    );
  });
};

export default CompareRubricScores;
