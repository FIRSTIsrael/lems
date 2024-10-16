import { useContext } from 'react';
import { ObjectId } from 'mongodb';
import Grid from '@mui/material/Unstable_Grid2';
import { blue, green, red, yellow } from '@mui/material/colors';
import { Stack, Typography } from '@mui/material';
import { localizedJudgingCategory, rubricsSchemas } from '@lems/season';
import { CompareContext } from './compare-view';

interface CompareRubricScoresProps {
  teamId: ObjectId;
}

const CompareRubricScores: React.FC<CompareRubricScoresProps> = ({ teamId }) => {
  const { rubrics, category } = useContext(CompareContext);
  const colors = { W: '#34c759', T: '#ffcc00', L: '#ff3b30' };
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
      <Grid container mx={2} pb={2}>
        <Grid xs={3.5}>
          <Typography fontWeight={600}>{localizedJudgingCategory[rubric.category].name}</Typography>
        </Grid>
        <Grid container xs={8.5}>
          {Object.entries(rubric.data?.values ?? {}).map(([clauseName, value]) => {
            let color;
            const highestScore = Math.max(
              ...competitorRubrics.map(r => r.data?.values?.[clauseName]?.value ?? -1)
            );
            if (value.value > highestScore) {
              color = colors['W'];
            } else if (value.value < highestScore) {
              color = colors['L'];
            } else {
              color = colors['T'];
            }

            return (
              <Grid xs={6} px={0.5}>
                <Typography>
                  {localizationMap[clauseName]}:{' '}
                  <span style={{ color: color, fontWeight: 600 }}>{value.value}</span>
                </Typography>
              </Grid>
            );
          })}
        </Grid>
      </Grid>
    );
  });
};

export default CompareRubricScores;
