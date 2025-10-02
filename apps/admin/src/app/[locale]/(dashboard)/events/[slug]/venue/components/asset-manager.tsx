'use client';

import { useState } from 'react';
import useSWR, { mutate } from 'swr';
import { useTranslations } from 'next-intl';
import {
  Paper,
  Typography,
  Box,
  Button,
  TextField,
  Stack,
  Alert,
  CircularProgress
} from '@mui/material';
import { AddRounded } from '@mui/icons-material';
import { Division, JudgingRoom, RobotGameTable } from '@lems/types/api/admin';
import { apiFetch } from '@lems/shared';
import { AssetCell } from './asset-cell';

type AssetType = JudgingRoom | RobotGameTable;

interface AssetManagerProps {
  division: Division;
  assetType: 'rooms' | 'tables';
}

export const AssetManager = <T extends AssetType>({ division, assetType }: AssetManagerProps) => {
  const t = useTranslations(`pages.events.venue`);
  const [editingAssets, setEditingAssets] = useState<{ [key: string]: string }>({});
  const [newAssetName, setNewAssetName] = useState('');
  const [saving, setSaving] = useState<{ [key: string]: boolean }>({});
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [successMessage, setSuccessMessage] = useState<string>('');

  const {
    data: assets = [] as T[],
    error,
    isLoading
  } = useSWR<T[]>(
    division ? `/admin/events/${division.eventId}/divisions/${division.id}/${assetType}` : null,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true
    }
  );

  const clearMessages = () => {
    setErrors({});
    setSuccessMessage('');
  };

  const showSuccess = () => {
    setSuccessMessage(t('messages.save-success'));
    setErrors({});
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const makeApiRequest = async (url: string, method: string, body?: object) => {
    return apiFetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      ...(body && { body: JSON.stringify(body) })
    });
  };

  const handleAddAsset = async () => {
    const name = newAssetName.trim();
    if (!name) {
      setErrors({ new: t('messages.validation.name-required') });
      return;
    }

    clearMessages();
    setSaving(prev => ({ ...prev, new: true }));

    try {
      const result = await makeApiRequest(
        `/admin/events/${division.eventId}/divisions/${division.id}/${assetType}`,
        'POST',
        {
          name
        }
      );

      if (result.ok) {
        setNewAssetName('');
        showSuccess();
        mutate(`/admin/events/${division.eventId}/divisions/${division.id}/${assetType}`);
      } else {
        setErrors({ new: t('messages.save-error') });
      }
    } catch {
      setErrors({ new: t('messages.save-error') });
    } finally {
      setSaving(prev => ({ ...prev, new: false }));
    }
  };

  const handleSaveAsset = async (asset: T) => {
    const name = editingAssets[asset.id]?.trim();
    if (!name) {
      setErrors({ [asset.id]: t('messages.validation.name-required') });
      return;
    }

    clearMessages();
    setSaving(prev => ({ ...prev, [asset.id]: true }));

    try {
      const result = await makeApiRequest(
        `/admin/events/${division.eventId}/divisions/${division.id}/${assetType}/${asset.id}`,
        'PUT',
        { name }
      );

      if (result.ok) {
        setEditingAssets(prev => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { [asset.id]: removed, ...rest } = prev;
          return rest;
        });
        showSuccess();
        mutate(`/admin/events/${division.eventId}/divisions/${division.id}/${assetType}`);
      } else {
        setErrors({ [asset.id]: t('messages.save-error') });
      }
    } catch {
      setErrors({ [asset.id]: t('messages.save-error') });
    } finally {
      setSaving(prev => ({ ...prev, [asset.id]: false }));
    }
  };

  const handleDeleteAsset = async (asset: T) => {
    clearMessages();
    try {
      const result = await makeApiRequest(
        `/admin/events/${division.eventId}/divisions/${division.id}/${assetType}/${asset.id}`,
        'DELETE'
      );

      if (result.ok) {
        setEditingAssets(prev => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { [asset.id]: removed, ...rest } = prev;
          return rest;
        });
        showSuccess();
        mutate(`/admin/events/${division.eventId}/divisions/${division.id}/${assetType}`);
      } else {
        setErrors({ [asset.id]: t('messages.delete-error') });
      }
    } catch {
      setErrors({ [asset.id]: t('messages.delete-error') });
    } finally {
      setSaving(prev => ({ ...prev, [asset.id]: false }));
    }
  };

  const startEditing = (asset: T) => {
    setEditingAssets(prev => ({ ...prev, [asset.id]: asset.name }));
    clearMessages();
  };

  const cancelEditing = (asset: T) => {
    setEditingAssets(prev => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [asset.id]: removed, ...rest } = prev;
      return rest;
    });
    clearMessages();
  };

  const isEditing = (assetId: string) => assetId in editingAssets;

  if (isLoading) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <CircularProgress />
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper sx={{ p: 3 }}>
        <Alert severity="error">{t('messages.load-error')}</Alert>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3, height: '100%' }}>
      <Typography variant="h6" gutterBottom>
        {t(`${assetType as string}.title`)}
      </Typography>

      {/* Add new asset */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" spacing={2} alignItems="flex-start">
          <TextField
            size="small"
            placeholder={t(`${assetType as string}.name-placeholder`)}
            value={newAssetName}
            onChange={e => {
              setNewAssetName(e.target.value);
              if (errors.new) {
                setErrors({ ...errors, new: '' });
              }
            }}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                handleAddAsset();
              }
            }}
            disabled={saving.new}
            error={!!errors.new}
            helperText={errors.new}
            sx={{ flexGrow: 1 }}
          />
          <Button
            variant="contained"
            startIcon={saving.new ? <CircularProgress size={16} /> : <AddRounded />}
            onClick={handleAddAsset}
            disabled={saving.new}
          >
            {t(`${assetType as string}.add-button`)}
          </Button>
        </Stack>

        {successMessage && (
          <Alert severity="success" sx={{ mt: 2 }}>
            {successMessage}
          </Alert>
        )}
      </Box>

      {/* Asset list */}
      {assets.length === 0 ? (
        <Typography variant="body2" color="text.secondary" textAlign="center" py={4}>
          {t(`${assetType as string}.empty-state`)}
        </Typography>
      ) : (
        <Stack spacing={2}>
          {assets.map((asset, index) => (
            <AssetCell
              key={asset.id}
              assetType={assetType}
              asset={asset}
              index={index}
              disabled={saving[asset.id]}
              isEditing={isEditing(asset.id)}
              editingValue={editingAssets[asset.id] ?? ''}
              onChange={(value: string) => {
                setEditingAssets({ ...editingAssets, [asset.id]: value });
              }}
              onDelete={() => handleDeleteAsset(asset)}
              onStartEditing={() => startEditing(asset)}
              onStopEditing={() => cancelEditing(asset)}
              onSave={() => handleSaveAsset(asset)}
              error={errors[asset.id] ?? null}
              setError={(error: string) => setErrors({ ...errors, [asset.id]: error })}
            />
          ))}
        </Stack>
      )}
    </Paper>
  );
};
