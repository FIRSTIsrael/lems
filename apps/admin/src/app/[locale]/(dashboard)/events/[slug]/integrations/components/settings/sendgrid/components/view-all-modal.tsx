'use client';

import { useState, useMemo, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Typography,
  Box,
  Alert,
  CircularProgress
} from '@mui/material';
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { useSendGridContacts } from '../context';
import { formatContactsForDataGrid } from '../helpers';

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

  const formattedContacts = useMemo(() => formatContactsForDataGrid(contacts), [contacts]);

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
        setDeleteError(error instanceof Error ? error.message : t('delete-error') || 'Delete failed');
      }
    }
  }, [deleteConfirm, deleteContact, t]);

  const handleCancelDelete = () => {
    setDeleteConfirm(null);
    setDeleteError(null);
  };

  const columns: GridColDef[] = [
    {
      field: 'team_number',
      headerName: t('dataGrid-column-team-number') || 'Team Number',
      width: 130,
      sortable: true,
      filterable: true
    },
    {
      field: 'region',
      headerName: t('dataGrid-column-region') || 'Region',
      width: 120,
      sortable: true,
      filterable: true
    },
    {
      field: 'recipient_email',
      headerName: t('dataGrid-column-email') || 'Email',
      flex: 1,
      minWidth: 250,
      sortable: true,
      filterable: true
    },
    {
      field: 'actions',
      type: 'actions',
      width: 80,
      getActions: params => [
        <GridActionsCellItem
          key="delete"
          icon={<DeleteIcon />}
          label="Delete"
          onClick={() => handleDeleteClick(params.row.team_number)}
        />
      ]
    }
  ];

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

          {isEmpty ? (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: 300,
                color: 'text.secondary'
              }}
            >
              <Typography>{t('no-contacts-uploaded')}</Typography>
            </Box>
          ) : (
            <DataGrid
              rows={formattedContacts}
              columns={columns}
              paginationModel={paginationModel}
              onPaginationModelChange={setPaginationModel}
              pageSizeOptions={[10, 25, 50]}
              checkboxSelection={false}
              disableRowSelectionOnClick
              density="compact"
              sx={{
                '& .MuiDataGrid-cell': {
                  borderColor: 'divider'
                },
                opacity: loading ? 0.5 : 1,
                pointerEvents: loading ? 'none' : 'auto'
              }}
            />
          )}

          {deleteConfirm !== null && (
            <Stack
              direction="row"
              spacing={2}
              sx={{
                bgcolor: 'warning.lighter',
                p: 2,
                borderRadius: 1,
                alignItems: 'center'
              }}
            >
              <Typography variant="body2">
                {t('confirm-delete-contact', { teamNumber: deleteConfirm })}
              </Typography>
              <Stack direction="row" spacing={1} sx={{ ml: 'auto' }}>
                <Button size="small" onClick={handleCancelDelete} disabled={loading}>
                  {t('cancel')}
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  color="error"
                  onClick={handleConfirmDelete}
                  disabled={loading}
                  startIcon={loading && <CircularProgress size={16} />}
                >
                  {loading ? t('deleting') || 'Deleting...' : t('delete')}
                </Button>
              </Stack>
            </Stack>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('close')}</Button>
      </DialogActions>
    </Dialog>
  );
};
