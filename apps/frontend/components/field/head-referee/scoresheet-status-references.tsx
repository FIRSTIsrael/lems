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
        if (status === 'waiting-for-head-ref-gp') return; // Backend status only
        return (
          <EditScoresheetButton key={status} status={status} active={true}>
            {localizedScoresheetStatus[status]}
          </EditScoresheetButton>
        );
      })}
    </Stack>
  );
};

export default ScoresheetStatusReferences;
