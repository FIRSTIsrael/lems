'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button, CircularProgress, Stack, TextField } from '@mui/material';
import { AddRounded } from '@mui/icons-material';
import { apiFetch } from '@lems/shared';
import { suggestPairNames } from './suggest-pair-names';

interface AddPairFormProps {
  tables: { name: string }[];
  basePath: string;
  onChanged: () => void;
  onSuccess: () => void;
}

export const AddPairForm: React.FC<AddPairFormProps> = ({
  tables,
  basePath,
  onChanged,
  onSuccess
}) => {
  const t = useTranslations('pages.events.venue');
  const [names, setNames] = useState<[string, string]>(() => suggestPairNames(tables));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const suggestion = suggestPairNames(tables);
  const suggestionKey = suggestion.join('\n');

  // Re-suggest whenever the existing tables change (e.g. after a pair is added).
  useEffect(() => {
    setNames(suggestPairNames(tables));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [suggestionKey]);

  const setName = (side: 0 | 1, value: string) => {
    setNames(prev => (side === 0 ? [value, prev[1]] : [prev[0], value]));
    if (error) setError('');
  };

  const handleAdd = async () => {
    const trimmed = names.map(name => name.trim()) as [string, string];
    if (!trimmed[0] || !trimmed[1]) {
      setError(t('messages.validation.name-required'));
      return;
    }

    setSaving(true);
    setError('');
    try {
      const result = await apiFetch(basePath, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ names: trimmed })
      });

      if (result.ok) {
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
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={2}
      sx={{ alignItems: { sm: 'flex-start' } }}
    >
      <TextField
        size="small"
        label={t('tables.side-a')}
        value={names[0]}
        onChange={e => setName(0, e.target.value)}
        onKeyDown={e => e.key === 'Enter' && handleAdd()}
        disabled={saving}
        error={!!error}
        helperText={error}
        sx={{ flexGrow: 1 }}
      />
      <TextField
        size="small"
        label={t('tables.side-b')}
        value={names[1]}
        onChange={e => setName(1, e.target.value)}
        onKeyDown={e => e.key === 'Enter' && handleAdd()}
        disabled={saving}
        error={!!error}
        sx={{ flexGrow: 1 }}
      />
      <Button
        variant="contained"
        startIcon={saving ? <CircularProgress size={16} /> : <AddRounded />}
        onClick={handleAdd}
        disabled={saving}
      >
        {t('tables.add-pair')}
      </Button>
    </Stack>
  );
};
