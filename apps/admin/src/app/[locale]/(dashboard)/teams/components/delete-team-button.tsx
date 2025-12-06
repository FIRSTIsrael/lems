import { Delete } from '@mui/icons-material';
import { GridActionsCellItem } from '@mui/x-data-grid';
import { Team } from '@lems/types/api/admin';
import { useState } from 'react';
import { Tooltip } from '@mui/material';
import { useTranslations } from 'next-intl';
import { DeleteTeamDialog } from './delete-team-dialog';

interface DeleteTeamButtonProps {
  team: Team;
}

export const DeleteTeamButton: React.FC<DeleteTeamButtonProps> = ({ team }) => {
  const t = useTranslations('pages.teams.list.delete');
  const [showDeletionDialog, setShowDeletionDialog] = useState(false);
  const isDisabled = team.deletable !== true;

  return (
    <>
      <Tooltip title={isDisabled ? t('disabled') : undefined}>
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
