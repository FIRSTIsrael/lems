'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button, Box } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { CreateDivisionDialog } from './create-division-dialog';

interface CreateDivisionButtonProps {
  onCreate: () => Promise<void>;
}

export const CreateDivisionButton = ({ onCreate }: CreateDivisionButtonProps) => {
  const t = useTranslations('pages.events.divisions');

  const [createModalOpen, setCreateModalOpen] = useState(false);

  return (
    <>
      <Box sx={{ mb: 3 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateModalOpen(true)}
        >
          {t('create-new-division')}
        </Button>
      </Box>

      <CreateDivisionDialog
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onDivisionCreated={onCreate}
      />
    </>
  );
};
