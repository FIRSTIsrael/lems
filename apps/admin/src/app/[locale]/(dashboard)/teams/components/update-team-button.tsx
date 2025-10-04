import { Edit } from '@mui/icons-material';
import { GridActionsCellItem } from '@mui/x-data-grid';
import { Team } from '@lems/types/api/admin';
import { useState } from 'react';
import { UpdateTeamDialog } from './update-team-dialog';

interface UpdateTeamButtonProps {
  team: Team;
}

export const UpdateTeamButton: React.FC<UpdateTeamButtonProps> = ({ team }) => {
  const [showEditDialog, setShowEditDialog] = useState(false);

  return (
    <>
      <GridActionsCellItem
        key="edit"
        icon={<Edit />}
        label="Edit team"
        onClick={() => setShowEditDialog(true)}
      />
      <UpdateTeamDialog
        team={team}
        open={showEditDialog}
        onClose={() => setShowEditDialog(false)}
      />
    </>
  );
};
