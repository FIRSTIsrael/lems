'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Typography,
  Alert
} from '@mui/material';
import { useSendGridContacts } from '../../context';
import { EmptyState } from './empty-state';
import { ContactsGrid } from './contacts-grid';
import { DeleteConfirmation } from './delete-confirmation';

interface ViewAllModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ViewAllModal: React.FC<ViewAllModalProps> = ({ isOpen, onClose }) => {
  const t = useTranslations('pages.events.integrations.detail-panel.settings.sendgrid');
  const { contacts, loading, deleteContact } = useSendGridContacts();
  const [paginationModel, setPaginationModel] = useState({ pageSize: 25, page: 0 });
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDeleteClick = (teamNumber: number) => {
    setDeleteConfirm(teamNumber);
    setDeleteError(null);
  };

  const handleConfirmDelete = useCallback(async () => {
    if (deleteConfirm !== null) {
      try {
        await deleteContact(deleteConfirm);
        setDeleteConfirm(null);
      } catch (error) {
        setDeleteError(error instanceof Error ? error.message : t('delete-error'));
      }
    }
  }, [deleteConfirm, deleteContact, t]);

  const handleCancelDelete = () => {
    setDeleteConfirm(null);
    setDeleteError(null);
  };

  const isEmpty = contacts.length === 0;

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>{t('view-all-contacts-modal-title')}</DialogTitle>
      <DialogContent sx={{ minHeight: 400 }}>
        <Stack spacing={2}>
          <Typography variant="body2" color="text.secondary">
            {t('view-all-contacts-count', { count: contacts.length })}
          </Typography>

          {deleteError && (
            <Alert severity="error" onClose={handleCancelDelete}>
              {deleteError}
            </Alert>
          )}

          {isEmpty && <EmptyState />}

          {!isEmpty && (
            <ContactsGrid
              contacts={contacts}
              loading={loading}
              paginationModel={paginationModel}
              onPaginationChange={setPaginationModel}
              onDelete={handleDeleteClick}
            />
          )}

          {deleteConfirm !== null && (
            <DeleteConfirmation
              teamNumber={deleteConfirm}
              loading={loading}
              onConfirm={handleConfirmDelete}
              onCancel={handleCancelDelete}
            />
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('close')}</Button>
      </DialogActions>
    </Dialog>
  );
};
