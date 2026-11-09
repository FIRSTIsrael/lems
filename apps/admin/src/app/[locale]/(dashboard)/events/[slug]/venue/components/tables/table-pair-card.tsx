'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Box, CircularProgress, IconButton, Stack, Typography } from '@mui/material';
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
  onSuccess: () => void;
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
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    if (!window.confirm(t('tables.delete-pair-confirm'))) return;

    setDeleting(true);
    setError('');
    try {
      const result = await apiFetch(`${basePath}/pairs/${group.key}`, { method: 'DELETE' });

      if (result.ok) {
        onSuccess();
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
            onClick={handleDelete}
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
      {error && (
        <Box sx={{ px: 1 }}>
          <Typography variant="caption" color="error">
            {error}
          </Typography>
        </Box>
      )}
    </TablePairOutline>
  );
};
