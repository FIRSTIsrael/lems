import { useContext } from 'react';
import { ObjectId } from 'mongodb';
import { Stack, Checkbox, Typography } from '@mui/material';
import { CoreValuesAwardsTypes } from '@lems/types';
import { localizedAward } from '@lems/season';
import { CompareContext } from './compare-view';

interface CompareNominationsProps {
  teamId: ObjectId;
}

const CompareNominations: React.FC<CompareNominationsProps> = ({ teamId }) => {
  const { category, rubrics } = useContext(CompareContext);
  const rubric = rubrics.find(r => r.teamId === teamId && r.category === 'core-values');

  if (category && category !== 'core-values') return;

  return (
    <Stack direction="row">
      {CoreValuesAwardsTypes.map(award => (
        <Stack>
          <Typography>{localizedAward[award].name}</Typography>
          <Checkbox readOnly checked={rubric?.data?.awards?.[award] ?? false} />
        </Stack>
      ))}
    </Stack>
  );
};

export default CompareNominations;
