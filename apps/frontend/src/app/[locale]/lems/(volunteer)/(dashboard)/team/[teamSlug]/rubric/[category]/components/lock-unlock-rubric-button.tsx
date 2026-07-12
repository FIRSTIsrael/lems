'use client';

import React, { useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { Button } from '@mui/material';
import { LockOpen as UnlockIcon, Lock as LockIcon } from '@mui/icons-material';
import { useMutation } from '@apollo/client/react';
import { toast } from 'react-hot-toast';
import { useRubric } from '../rubric-context';
import { UPDATE_RUBRIC_STATUS_MUTATION } from '../graphql';
import { useUser } from '../../../../../../components/user-context';
import { useEvent } from '../../../../../../components/event-context';
import { RoleAuthorizer } from '../../../../../../components/role-authorizer';

interface LockUnlockRubricButtonProps {
  disabled?: boolean;
}

export const LockUnlockRubricButton: React.FC<LockUnlockRubricButtonProps> = ({
  disabled = false
}) => {
  const t = useTranslations('pages.rubric');
  const { rubric, validation } = useRubric();
  const user = useUser();
  const { currentDivision } = useEvent();
  const { category } = useParams() as { category: string };

  const isLocked = rubric.status === 'locked';

  const [updateStatusMutation] = useMutation(UPDATE_RUBRIC_STATUS_MUTATION, {
    onError: () => {
      if (isLocked) {
        toast.error(t('toasts.unlock-error'));
      } else {
        toast.error(t('toasts.submit-error'));
      }
    },
    onCompleted: () => {
      // Invert logic, when the callback is triggered, the status has already changed
      if (!isLocked) {
        toast.success(t('toasts.unlock-success'));
      } else {
        toast.success(t('toasts.submit-success'));
      }
    }
  });

  const handleAction = useCallback(() => {
    const newStatus = isLocked ? 'completed' : 'locked';

    updateStatusMutation({
      variables: {
        divisionId: currentDivision.id,
        rubricId: rubric.id,
        status: newStatus
      }
    });
  }, [isLocked, currentDivision.id, rubric.id, updateStatusMutation]);

  return (
    <RoleAuthorizer
      user={user}
      allowedRoles="judge-advisor"
      conditionalRoles="lead-judge"
      conditions={{ roleInfo: { category } }}
    >
      <Button
        variant={isLocked ? 'outlined' : 'contained'}
        color={isLocked ? 'primary' : 'primary'}
        size="large"
        disabled={disabled || !validation.isValid}
        onClick={handleAction}
        startIcon={isLocked ? <UnlockIcon /> : <LockIcon />}
        sx={{
          minWidth: 150,
          py: 1.5,
          borderRadius: 2,
          textTransform: 'none',
          fontSize: '1rem',
          fontWeight: 600
        }}
      >
        {isLocked ? t('actions.unlock-rubric') : t('actions.submit-rubric')}
      </Button>
    </RoleAuthorizer>
  );
};
