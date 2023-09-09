import { Stack } from '@mui/material';
import EditRubricButton from '../../input/edit-rubric-button';
import { RubricStatusTypes } from '@lems/types';
import { localizeRubricStatus } from '../../../lib/utils/localization';

const RubricStatusReferences = () => {
  return (
    <Stack direction="row" justifyContent="center">
      {RubricStatusTypes.map(status => {
        return (
          <EditRubricButton key={status} status={status}>
            {localizeRubricStatus(status).name}
          </EditRubricButton>
        );
      })}
    </Stack>
  );
};

export default RubricStatusReferences;
