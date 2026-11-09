'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Box, CircularProgress, IconButton, Stack, TextField, Typography } from '@mui/material';
import { Check, Close, SwapHorizRounded } from '@mui/icons-material';
import { RobotGameTable } from '@lems/types/api/admin';
import { apiFetch } from '@lems/shared';
import type { TableGroup } from '@lems/shared/utils';
import { SwapTableDialog } from './swap-table-dialog';

interface TableSlotProps {
  table: RobotGameTable;
  groups: TableGroup<RobotGameTable>[];
  basePath: string;
  onChanged: () => void;
  onSuccess: () => void;
}

export const TableSlot: React.FC<TableSlotProps> = ({
  table,
  groups,
  basePath,
  onChanged,
  onSuccess
}) => {
  const t = useTranslations('pages.events.venue');
  const [editingValue, setEditingValue] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [swapOpen, setSwapOpen] = useState(false);

  const stopEditing = () => {
    setEditingValue(null);
    setError('');
  };

  const handleSave = async () => {
    const name = editingValue?.trim();
    if (!name) {
      setError(t('messages.validation.name-required'));
      return;
    }

    setSaving(true);
    setError('');
    try {
      const result = await apiFetch(`${basePath}/${table.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });

      if (result.ok) {
        setEditingValue(null);
        onSuccess();
        onChanged();
      } else {
        setError(t('messages.save-error'));
      }
    } catch {
      setError(t('messages.save-error'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
        <Typography
          variant="subtitle2"
          sx={{ color: 'text.secondary', fontWeight: 600, minWidth: 16, textAlign: 'center' }}
        >
          {table.side}
        </Typography>
        {editingValue !== null ? (
          <>
            <TextField
              size="small"
              value={editingValue}
              onChange={e => {
                setEditingValue(e.target.value);
                if (error) setError('');
              }}
              onKeyDown={e => {
                if (e.key === 'Enter') handleSave();
                else if (e.key === 'Escape') stopEditing();
              }}
              disabled={saving}
              error={!!error}
              sx={{ flexGrow: 1 }}
            />
            <IconButton size="small" color="primary" onClick={handleSave} disabled={saving}>
              {saving ? <CircularProgress size={16} /> : <Check />}
            </IconButton>
            <IconButton size="small" onClick={stopEditing} disabled={saving}>
              <Close />
            </IconButton>
          </>
        ) : (
          <Stack
            direction="row"
            sx={{
              flexGrow: 1,
              minWidth: 0,
              justifyContent: 'space-between',
              alignItems: 'center',
              px: 2,
              border: '1px solid',
              borderColor: error ? 'error.main' : 'divider',
              borderRadius: 1,
              minHeight: '40px',
              '&:hover': { backgroundColor: 'action.hover' }
            }}
          >
            <Typography
              variant="body1"
              onClick={() => setEditingValue(table.name)}
              sx={{ cursor: 'pointer', flexGrow: 1, userSelect: 'none' }}
            >
              {table.name}
            </Typography>
            <IconButton
              size="small"
              title={t('tables.swap')}
              aria-label={t('tables.swap')}
              onClick={() => setSwapOpen(true)}
            >
              <SwapHorizRounded />
            </IconButton>
          </Stack>
        )}
      </Stack>
      {error && (
        <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block', px: 2 }}>
          {error}
        </Typography>
      )}
      {swapOpen && (
        <SwapTableDialog
          table={table}
          groups={groups}
          basePath={basePath}
          onClose={() => setSwapOpen(false)}
          onSwapped={() => {
            setSwapOpen(false);
            onSuccess();
            onChanged();
          }}
        />
      )}
    </Box>
  );
};
