import { Delete } from '@mui/icons-material';
import { GridActionsCellItem } from '@mui/x-data-grid';
import { Team } from '@lems/types/api/admin';
import { useState } from 'react';
import { Tooltip } from '@mui/material';
import { DeleteTeamDialog } from './delete-team-dialog';

interface DeleteTeamButtonProps {
  team: Team;
}

export const DeleteTeamButton: React.FC<DeleteTeamButtonProps> = ({ team }) => {
  const [showDeletionDialog, setShowDeletionDialog] = useState(false);
  const isDisabled = team.status === 'active' || team.status === 'inactive';

  return (
    <>
      <Tooltip
        title={
          isDisabled ? 'Cannot delete team which has participated in an event in the past' : ''
        }
      >
        <span>
          <GridActionsCellItem
            key="delete"
            icon={<Delete />}
            label="Delete team"
            disabled={isDisabled}
            onClick={() => setShowDeletionDialog(true)}
          />
        </span>
      </Tooltip>

      <DeleteTeamDialog
        team={team}
        open={showDeletionDialog}
        onClose={() => setShowDeletionDialog(false)}
      />
    </>
  );
};
