import { Delete } from '@mui/icons-material';
import { GridActionsCellItem } from '@mui/x-data-grid';
import { Team } from '@lems/types/api/admin';
import { useState } from 'react';
import { DeleteTeamDialog } from './delete-team-dialog';

interface DeleteTeamButtonProps {
  team: Team;
}

export const DeleteTeamButton: React.FC<DeleteTeamButtonProps> = ({ team }) => {
  const [showDeletionDialog, setShowDeletionDialog] = useState(false);

  return (
    <>
      <GridActionsCellItem
        key="delete"
        icon={<Delete />}
        label="Delete team"
        onClick={() => setShowDeletionDialog(true)}
      />
      <DeleteTeamDialog
        team={team}
        open={showDeletionDialog}
        onClose={() => setShowDeletionDialog(false)}
      />
    </>
  );
};
