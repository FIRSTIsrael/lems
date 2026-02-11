'use client';

import React, { useCallback, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import { CheckCircle as CheckCircleIcon } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useMutation } from '@apollo/client/react';
import { toast } from 'react-hot-toast';
import { useRubric } from '../rubric-context';
import { UPDATE_RUBRIC_STATUS_MUTATION } from '../graphql';
import { useUser } from '../../../../../../../components/user-context';
import { useEvent } from '../../../../../../components/event-context';
import { RoleAuthorizer } from '../../../../../../../components/role-authorizer';

interface SubmitRubricButtonProps {
  disabled?: boolean;
}

export const SubmitRubricButton: React.FC<SubmitRubricButtonProps> = ({ disabled = false }) => {
  const t = useTranslations('pages.rubric');
  const { rubric, validation } = useRubric();
  const router = useRouter();
  const user = useUser();
  const { currentDivision } = useEvent();
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);

  const isDisabled = disabled || !validation.isValid;

  const [submitRubricMutation] = useMutation(UPDATE_RUBRIC_STATUS_MUTATION, {
    onError: () => {
      toast.error(t('errors.submit'));
    },
    onCompleted: () => {
      setOpenConfirmDialog(false);
      router.push(`/lems/${user.role}`);
    }
  });

  const handleOpenConfirm = useCallback(() => {
    setOpenConfirmDialog(true);
  }, []);

  const handleCloseConfirm = useCallback(() => {
    setOpenConfirmDialog(false);
  }, []);

  const handleConfirmSubmit = useCallback(() => {
    submitRubricMutation({
      variables: {
        divisionId: currentDivision.id,
        rubricId: rubric.id,
        status: 'locked'
      }
    });
  }, [currentDivision.id, rubric.id, submitRubricMutation]);

  return (
    <RoleAuthorizer user={user} allowedRoles={['judge-advisor', 'lead-judge']}>
      <>
        <Button
          variant="contained"
          color="primary"
          size="large"
          disabled={isDisabled}
          onClick={handleOpenConfirm}
          startIcon={<CheckCircleIcon />}
          sx={{
            minWidth: 200,
            py: 1.5,
            borderRadius: 2,
            textTransform: 'none',
            fontSize: '1rem',
            fontWeight: 600
          }}
        >
          {t('actions.submit-rubric')}
        </Button>

        <Dialog
          open={openConfirmDialog}
          onClose={handleCloseConfirm}
          maxWidth="sm"
          fullWidth
          aria-labelledby="submit-dialog-title"
          aria-describedby="submit-dialog-description"
        >
          <DialogTitle id="submit-dialog-title" sx={{ pb: 1 }}>
            {t('submit-dialog.title')}
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="submit-dialog-description" sx={{ mt: 1 }}>
              {t('submit-dialog.description')}
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ p: 2, pt: 1 }}>
            <Button
              onClick={handleCloseConfirm}
              color="inherit"
              sx={{ textTransform: 'none', fontSize: '0.95rem' }}
            >
              {t('submit-dialog.cancel')}
            </Button>
            <Button
              onClick={handleConfirmSubmit}
              variant="contained"
              color="primary"
              sx={{ textTransform: 'none', fontSize: '0.95rem' }}
            >
              {t('submit-dialog.confirm')}
            </Button>
          </DialogActions>
        </Dialog>
      </>
    </RoleAuthorizer>
  );
};
