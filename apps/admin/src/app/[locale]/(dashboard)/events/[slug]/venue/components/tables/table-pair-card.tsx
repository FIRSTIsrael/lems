'use client';

import { useId, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Stack,
  Typography
} from '@mui/material';
import { Delete } from '@mui/icons-material';
import { RobotGameTable } from '@lems/types/api/admin';
import { apiFetch } from '@lems/shared';
import { TablePairOutline } from '@lems/shared/components';
import type { TableGroup } from '@lems/shared/utils';
import { TableSlot } from './table-slot';

interface TablePairCardProps {
  index: number;
  group: TableGroup<RobotGameTable>;
  groups: TableGroup<RobotGameTable>[];
  basePath: string;
  label?: string;
  readOnly?: boolean;
  onChanged: () => void;
  onSuccess: (message?: 'save-success' | 'delete-success') => void;
}

export const TablePairCard: React.FC<TablePairCardProps> = ({
  index,
  group,
  groups,
  basePath,
  label,
  readOnly = false,
  onChanged,
  onSuccess
}) => {
  const t = useTranslations('pages.events.venue');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const titleId = useId();

  const handleDelete = async () => {
    setDeleting(true);
    setError('');
    try {
      const result = await apiFetch(`${basePath}/pairs/${group.key}`, { method: 'DELETE' });

      if (result.ok) {
        setConfirmOpen(false);
        onSuccess('delete-success');
        onChanged();
      } else {
        setError(t('messages.delete-error'));
      }
    } catch {
      setError(t('messages.delete-error'));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <TablePairOutline sx={{ flexDirection: 'column' }}>
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', px: 1 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          {label ?? t('tables.pair-label', { index })}
        </Typography>
        {!readOnly && (
          <IconButton
            size="small"
            color="error"
            title={t('tables.delete-pair')}
            aria-label={t('tables.delete-pair')}
            onClick={() => {
              setError('');
              setConfirmOpen(true);
            }}
            disabled={deleting}
          >
            {deleting ? <CircularProgress size={16} /> : <Delete />}
          </IconButton>
        )}
      </Stack>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ p: 0.5 }}>
        {group.tables.map(table => (
          <TableSlot
            key={table.id}
            table={table}
            groups={groups}
            basePath={basePath}
            readOnly={readOnly}
            onChanged={onChanged}
            onSuccess={onSuccess}
          />
        ))}
      </Stack>
      <Dialog
        open={confirmOpen}
        onClose={deleting ? undefined : () => setConfirmOpen(false)}
        aria-labelledby={titleId}
      >
        <DialogTitle id={titleId}>{t('tables.delete-pair')}</DialogTitle>
        <DialogContent>
          <DialogContentText>{t('tables.delete-pair-confirm')}</DialogContentText>
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)} disabled={deleting}>
            {t('tables.cancel')}
          </Button>
          <Button
            onClick={handleDelete}
            color="error"
            variant="contained"
            disabled={deleting}
            startIcon={deleting ? <CircularProgress size={16} /> : <Delete />}
          >
            {t('tables.delete-pair')}
          </Button>
        </DialogActions>
      </Dialog>
    </TablePairOutline>
  );
};
