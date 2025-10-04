import { Delete } from '@mui/icons-material';
import { GridActionsCellItem } from '@mui/x-data-grid';
import { Event, TeamWithDivision } from '@lems/types/api/admin';
import { useState } from 'react';
import { UnregisterTeamDialog } from './unregister-team-dialog';

interface UnregisterTeamButtonProps {
  team: TeamWithDivision;
  event: Event;
}

export const UnregisterTeamButton: React.FC<UnregisterTeamButtonProps> = ({ team, event }) => {
  const [showUnregisterDialog, setShowUnregisterDialog] = useState(false);

  return (
    <>
      <GridActionsCellItem
        key="delete"
        icon={<Delete />}
        label="Delete team"
        onClick={() => setShowUnregisterDialog(true)}
      />
      <UnregisterTeamDialog
        team={team}
        event={event}
        open={showUnregisterDialog}
        onClose={() => setShowUnregisterDialog(false)}
      />
    </>
  );
};
