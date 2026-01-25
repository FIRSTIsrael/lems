'use client';

import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import { IconButton, Tooltip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import LockIcon from '@mui/icons-material/Lock';
import type { ScoresheetItem } from '../graphql';

interface EditButtonProps {
  scoresheet: ScoresheetItem;
  isEditMode: boolean;
}

export const EditButton: React.FC<EditButtonProps> = ({ scoresheet, isEditMode: forceEdit }) => {
  const t = useTranslations('pages.scoresheet');
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleToggleEditMode = () => {
    const params = new URLSearchParams(searchParams);
    if (forceEdit) {
      params.delete('editMode');
    } else {
      params.set('editMode', 'true');
    }
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const isInGPOrSubmittedStatus = scoresheet.status === 'gp' || scoresheet.status === 'submitted';

  if (!isInGPOrSubmittedStatus) return null;

  return (
    <Tooltip title={forceEdit ? t('disable-edit-mode') : t('enable-edit-mode')}>
      <IconButton
        size="small"
        onClick={handleToggleEditMode}
        sx={{
          border: '1px solid',
          borderColor: forceEdit ? 'primary.main' : 'divider',
          backgroundColor: forceEdit ? 'primary.lighter' : 'transparent',
          height: 40,
          width: 40,
          '&:hover': {
            backgroundColor: forceEdit ? 'primary.lighter' : 'action.hover'
          }
        }}
      >
        {forceEdit ? (
          <EditIcon fontSize="small" sx={{ color: forceEdit ? 'primary.main' : 'inherit' }} />
        ) : (
          <LockIcon fontSize="small" sx={{ color: forceEdit ? 'primary.main' : 'inherit' }} />
        )}
      </IconButton>
    </Tooltip>
  );
};
