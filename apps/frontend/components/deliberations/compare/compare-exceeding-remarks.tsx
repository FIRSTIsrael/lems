import { useContext } from 'react';
import { ObjectId } from 'mongodb';
import { Stack, Typography } from '@mui/material';
import { rubricsSchemas } from '@lems/season';
import { CompareContext } from './compare-view';

interface CompareExceedingRemarksProps {
  teamId: ObjectId;
}

const CompareExceedingRemarks: React.FC<CompareExceedingRemarksProps> = ({ teamId }) => {
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
      <Stack>
        {Object.entries(rubric.data?.values ?? {}).map(([key, value]) => {
          if (!value.notes) {
            return;
          }
          return (
            <Typography>
              נימוק ל{localizationMap[key]} : {value.notes}
            </Typography>
          );
        })}
      </Stack>
    );
  });
};

export default CompareExceedingRemarks;
