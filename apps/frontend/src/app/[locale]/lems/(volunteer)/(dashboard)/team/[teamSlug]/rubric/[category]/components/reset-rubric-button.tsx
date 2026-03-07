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
import { Refresh as RefreshIcon } from '@mui/icons-material';
import { useMutation } from '@apollo/client/react';
import { toast } from 'react-hot-toast';
import { underscoresToHyphens } from '@lems/shared/utils';
import { useRubric } from '../rubric-context';
import { RESET_RUBRIC_MUTATION } from '../graphql/mutations/reset';
import { useUser } from '../../../../../../components/user-context';
import { useEvent } from '../../../../../../components/event-context';
import { RoleAuthorizer } from '../../../../../../components/role-authorizer';

interface ResetRubricButtonProps {
  disabled?: boolean;
}

export const ResetRubricButton: React.FC<ResetRubricButtonProps> = ({ disabled = false }) => {
  const t = useTranslations('pages.rubric');
  const { rubric } = useRubric();
  const user = useUser();
  const { currentDivision } = useEvent();
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);

  const [resetRubricMutation] = useMutation(RESET_RUBRIC_MUTATION, {
    onError: () => {
      toast.error(t('toasts.reset-error'));
    },
    onCompleted: () => {
      setOpenConfirmDialog(false);
      toast.success(t('toasts.reset-success'));
    }
  });

  const handleOpenConfirm = useCallback(() => {
    setOpenConfirmDialog(true);
  }, []);

  const handleCloseConfirm = useCallback(() => {
    setOpenConfirmDialog(false);
  }, []);

  const handleConfirmReset = useCallback(() => {
    resetRubricMutation({
      variables: {
        divisionId: currentDivision.id,
        rubricId: rubric.id
      }
    });
  }, [rubric.id, resetRubricMutation, currentDivision.id]);

  return (
    <RoleAuthorizer
      user={user}
      allowedRoles="judge-advisor"
      conditionalRoles="lead-judge"
      conditions={{ roleInfo: { category: underscoresToHyphens(rubric.category) } }}
    >
      <>
        <Button
          variant="outlined"
          color="error"
          size="large"
          disabled={disabled}
          onClick={handleOpenConfirm}
          startIcon={<RefreshIcon />}
          sx={{
            minWidth: 150,
            py: 1.5,
            borderRadius: 2,
            textTransform: 'none',
            fontSize: '1rem',
            fontWeight: 600
          }}
        >
          {t('actions.reset')}
        </Button>

        <Dialog
          open={openConfirmDialog}
          onClose={handleCloseConfirm}
          maxWidth="sm"
          fullWidth
          aria-labelledby="reset-dialog-title"
          aria-describedby="reset-dialog-description"
        >
          <DialogTitle id="reset-dialog-title" sx={{ pb: 1 }}>
            {t('reset-dialog.title')}
          </DialogTitle>
          <DialogContent>
            <DialogContentText
              id="reset-dialog-description"
              sx={{ mt: 1, color: 'warning.main', fontWeight: 500 }}
            >
              {t('reset-dialog.warning')}
            </DialogContentText>
            <DialogContentText sx={{ mt: 1.5 }}>{t('reset-dialog.description')}</DialogContentText>
          </DialogContent>
          <DialogActions sx={{ p: 2, pt: 1 }}>
            <Button onClick={handleCloseConfirm} color="inherit" sx={{ fontSize: '0.95rem' }}>
              {t('reset-dialog.cancel')}
            </Button>
            <Button
              onClick={handleConfirmReset}
              variant="contained"
              color="error"
              sx={{ fontSize: '0.95rem' }}
            >
              {t('reset-dialog.confirm')}
            </Button>
          </DialogActions>
        </Dialog>
      </>
    </RoleAuthorizer>
  );
};
