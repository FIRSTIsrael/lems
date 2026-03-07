'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@mui/material';
import { Check as CheckIcon } from '@mui/icons-material';
import { useUser } from '../../../../../../components/user-context';
import { RoleAuthorizer } from '../../../../../../components/role-authorizer';

interface SaveButtonProps {
  disabled?: boolean;
}

export const SaveButton: React.FC<SaveButtonProps> = ({ disabled = false }) => {
  const t = useTranslations('pages.rubric');
  const user = useUser();

  return (
    <RoleAuthorizer user={user} allowedRoles={['judge']}>
      <Button
        variant="contained"
        color="success"
        size="large"
        disabled={disabled}
        startIcon={<CheckIcon />}
        sx={{
          minWidth: 150,
          py: 1.5,
          borderRadius: 2,
          textTransform: 'none',
          fontSize: '1rem',
          fontWeight: 600
        }}
      >
        {t('actions.save')}
      </Button>
    </RoleAuthorizer>
  );
};
