'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  MenuItem,
  Select
} from '@mui/material';
import { RobotGameTable } from '@lems/types/api/admin';
import { apiFetch } from '@lems/shared';
import type { TableGroup } from '@lems/shared/utils';

interface SwapTableDialogProps {
  table: RobotGameTable;
  groups: TableGroup<RobotGameTable>[];
  basePath: string;
  onClose: () => void;
  onSwapped: () => void;
}

export const SwapTableDialog: React.FC<SwapTableDialogProps> = ({
  table,
  groups,
  basePath,
  onClose,
  onSwapped
}) => {
  const t = useTranslations('pages.events.venue');
  const [otherTableId, setOtherTableId] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const options = groups.flatMap((group, index) =>
    group.tables
      .filter(other => other.id !== table.id)
      .map(other => ({
        id: other.id,
        label: t('tables.position', { index: index + 1, side: other.side, name: other.name })
      }))
  );

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const result = await apiFetch(`${basePath}/${table.id}/swap`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otherTableId })
      });

      if (result.ok) {
        onSwapped();
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
    <Dialog open onClose={saving ? undefined : onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{t('tables.swap-title', { name: table.name })}</DialogTitle>
      <DialogContent>
        <FormControl fullWidth size="small" sx={{ mt: 1 }}>
          <Select
            value={otherTableId}
            onChange={e => setOtherTableId(e.target.value)}
            disabled={saving}
          >
            {options.map(option => (
              <MenuItem key={option.id} value={option.id}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          {t('tables.cancel')}
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={saving || !otherTableId}
          startIcon={saving ? <CircularProgress size={16} /> : undefined}
        >
          {t('tables.save-button')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
