import { useContext } from 'react';
import { ObjectId } from 'mongodb';
import Grid from '@mui/material/Unstable_Grid2';
import { rubricsSchemas } from '@lems/season';
import { CompareContext } from './compare-view';

interface CompareRubricScoresProps {
  teamId: ObjectId;
}

const CompareRubricScores: React.FC<CompareRubricScoresProps> = ({ teamId }) => {
  const { rubrics } = useContext(CompareContext);
  const teamRubrics = rubrics.filter(rubric => rubric.teamId === teamId);

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
        {Object.entries(rubric.data?.values ?? {}).map(([key, value]) => (
          <Grid xs={6}>
            {localizationMap[key]}:{value.value}
          </Grid>
        ))}
      </Grid>
    );
  });
};

export default CompareRubricScores;
