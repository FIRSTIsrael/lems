import { useContext } from 'react';
import { ObjectId } from 'mongodb';
import { Stack, Checkbox, Typography } from '@mui/material';
import { CoreValuesAwardsTypes } from '@lems/types';
import { localizedAward } from '@lems/season';
import { CompareContext } from './compare-view';
import CheckIcon from '@mui/icons-material/Check';
import RemoveIcon from '@mui/icons-material/Remove';

interface CompareNominationsProps {
  teamId: ObjectId;
}

const CompareNominations: React.FC<CompareNominationsProps> = ({ teamId }) => {
  const { rubrics } = useContext(CompareContext);
  const rubric = rubrics.find(r => r.teamId === teamId && r.category === 'core-values');

  return (
    <Stack direction="row">
      {CoreValuesAwardsTypes.map(award => (
        <Stack width="100%" alignItems="center">
          <Typography>{localizedAward[award].name}</Typography>
          {rubric?.data?.awards?.[award] ? (
            <CheckIcon sx={{ color: '#388e3c' }} />
          ) : (
            <RemoveIcon sx={{ color: '#666' }} />
          )}
        </Stack>
      ))}
    </Stack>
  );
};

export default CompareNominations;
