import { Stack } from '@mui/material';
import { RubricStatusTypes } from '@lems/types';
import EditRubricButton from './edit-rubric-button';
import { localizedRubricStatus } from '../../localization/rubrics';

const RubricStatusReferences = () => {
  return (
    <Stack direction="row" justifyContent="center">
      {RubricStatusTypes.map(status => {
        return (
          <EditRubricButton key={status} status={status} active={true}>
            {localizedRubricStatus[status]}
          </EditRubricButton>
        );
      })}
    </Stack>
  );
};

export default RubricStatusReferences;
