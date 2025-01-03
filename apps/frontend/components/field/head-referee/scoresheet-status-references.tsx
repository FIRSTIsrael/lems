import { Stack } from '@mui/material';
import { ScoresheetStatusTypes } from '@lems/types';
import { localizedScoresheetStatus } from '@lems/season';
import EditScoresheetButton from './edit-scoresheet-button';

const ScoresheetStatusReferences = () => {
  return (
    <Stack direction="row" justifyContent="center">
      <EditScoresheetButton key="unregistered" status="empty" active={false}>
        לא הגיעו לאירוע
      </EditScoresheetButton>
      {ScoresheetStatusTypes.map(status => {
        return (
          <EditScoresheetButton key={status} status={status} active={true}>
            {localizedScoresheetStatus[status]}
          </EditScoresheetButton>
        );
      })}
      <EditScoresheetButton key="escalated" status="empty" active={true} escalated>
        ממתין לשופט ראשי
      </EditScoresheetButton>
    </Stack>
  );
};

export default ScoresheetStatusReferences;
