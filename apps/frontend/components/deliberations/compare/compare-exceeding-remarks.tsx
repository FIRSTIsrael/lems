import { useContext } from 'react';
import { ObjectId } from 'mongodb';
import { Stack, Typography } from '@mui/material';
import { localizedJudgingCategory, rubricsSchemas } from '@lems/season';
import { CompareContext } from './compare-view';

interface CompareExceedingRemarksProps {
  teamId: ObjectId;
}

const CompareExceedingRemarks: React.FC<CompareExceedingRemarksProps> = ({ teamId }) => {
  const { rubrics, category } = useContext(CompareContext);
  let teamRubrics = rubrics.filter(rubric => rubric.teamId === teamId);

  if (category) {
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
    const remarks = Object.entries(rubric.data?.values ?? {}).map(([key, value]) => {
      if (!value.notes) {
        return;
      }
      return (
        <Typography>
          <span style={{ fontWeight: 500 }}>נימוק ל{localizationMap[key]}:</span> {value.notes}
        </Typography>
      );
    });

    return (
      <Stack px={2} height={96}>
        {!remarks.find(remark => !!remark) ? (
          <Typography>
            לא נמצאו ציונים ״מצטיינים״ בתחום {localizedJudgingCategory[rubric.category].name}
          </Typography>
        ) : (
          remarks
        )}
      </Stack>
    );
  });
};

export default CompareExceedingRemarks;
