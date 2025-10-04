import { Delete } from '@mui/icons-material';
import { GridActionsCellItem } from '@mui/x-data-grid';
import { TeamWithDivision } from '@lems/types/api/admin';
import { useState } from 'react';
import { RemoveTeamDialog } from './remove-team-dialog';

interface RemoveTeamButtonProps {
  team: TeamWithDivision;
}

export const RemoveTeamButton: React.FC<RemoveTeamButtonProps> = ({ team }) => {
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);

  return (
    <>
      <GridActionsCellItem
        key="remove"
        icon={<Delete />}
        label="Remove team"
        onClick={() => setShowRemoveDialog(true)}
      />
      <RemoveTeamDialog
        team={team}
        open={showRemoveDialog}
        onClose={() => setShowRemoveDialog(false)}
      />
    </>
  );
};
