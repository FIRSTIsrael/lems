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
import { CheckCircle as ApproveIcon } from '@mui/icons-material';
import { useMutation } from '@apollo/client/react';
import { toast } from 'react-hot-toast';
import { useRubric } from '../rubric-context';
import { UPDATE_RUBRIC_STATUS_MUTATION } from '../graphql';
import { useUser } from '../../../../../../components/user-context';
import { useEvent } from '../../../../../../components/event-context';
import { RoleAuthorizer } from '../../../../../../components/role-authorizer';

interface ApproveRubricButtonProps {
  disabled?: boolean;
}

export const ApproveRubricButton: React.FC<ApproveRubricButtonProps> = ({ disabled = false }) => {
  const t = useTranslations('pages.rubric');
  const { rubric } = useRubric();
  const user = useUser();
  const { currentDivision } = useEvent();
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);

  const isLocked = rubric.status === 'locked';
  const isButtonDisabled = disabled || !isLocked;

  const [approveRubricMutation] = useMutation(UPDATE_RUBRIC_STATUS_MUTATION, {
    onError: () => {
      toast.error(t('toasts.approve-error'));
    },
    onCompleted: () => {
      setOpenConfirmDialog(false);
      toast.success(t('toasts.approve-success'));
    }
  });

  const handleOpenConfirm = useCallback(() => {
    setOpenConfirmDialog(true);
  }, []);

  const handleCloseConfirm = useCallback(() => {
    setOpenConfirmDialog(false);
  }, []);

  const handleConfirmApprove = useCallback(() => {
    approveRubricMutation({
      variables: {
        divisionId: currentDivision.id,
        rubricId: rubric.id,
        status: 'approved'
      }
    });
  }, [currentDivision.id, rubric.id, approveRubricMutation]);

  return (
    <RoleAuthorizer user={user} allowedRoles="judge-advisor">
      <>
        <Button
          variant="contained"
          color="success"
          size="large"
          disabled={isButtonDisabled}
          onClick={handleOpenConfirm}
          startIcon={<ApproveIcon />}
          sx={{
            minWidth: 150,
            py: 1.5,
            borderRadius: 2,
            textTransform: 'none',
            fontSize: '1rem',
            fontWeight: 600
          }}
        >
          {t('actions.approve-rubric')}
        </Button>

        <Dialog
          open={openConfirmDialog}
          onClose={handleCloseConfirm}
          maxWidth="sm"
          fullWidth
          aria-labelledby="approve-dialog-title"
          aria-describedby="approve-dialog-description"
        >
          <DialogTitle id="approve-dialog-title" sx={{ pb: 1 }}>
            {t('approve-dialog.title')}
          </DialogTitle>
          <DialogContent>
            <DialogContentText
              id="approve-dialog-description"
              sx={{ mt: 1, color: 'warning.main', fontWeight: 500 }}
            >
              {t('approve-dialog.warning')}
            </DialogContentText>
            <DialogContentText sx={{ mt: 1.5 }}>
              {t('approve-dialog.description')}
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ p: 2, pt: 1 }}>
            <Button
              onClick={handleCloseConfirm}
              color="inherit"
              sx={{ textTransform: 'none', fontSize: '0.95rem' }}
            >
              {t('approve-dialog.cancel')}
            </Button>
            <Button
              onClick={handleConfirmApprove}
              variant="contained"
              color="success"
              sx={{ textTransform: 'none', fontSize: '0.95rem' }}
            >
              {t('approve-dialog.confirm')}
            </Button>
          </DialogActions>
        </Dialog>
      </>
    </RoleAuthorizer>
  );
};
