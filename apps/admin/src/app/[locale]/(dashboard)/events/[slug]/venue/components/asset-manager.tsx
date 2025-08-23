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
  IconButton,
  Stack,
  Alert,
  CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import { JudgingRoom, RobotGameTable } from '@lems/types/api/admin';
import { apiFetch } from '../../../../../../../lib/fetch';

type AssetType = JudgingRoom | RobotGameTable;

interface AssetManagerProps {
  divisionId: string;
  assetType: 'rooms' | 'tables';
}

const AssetManager = <T extends AssetType>({ divisionId, assetType }: AssetManagerProps) => {
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
  } = useSWR<T[]>(divisionId ? `/admin/divisions/${divisionId}/${assetType}` : null, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true
  });

  const handleAddAsset = async () => {
    if (!newAssetName.trim()) {
      setErrors({ new: t('messages.validation.name-required') });
      return;
    }

    setErrors({});
    setSuccessMessage('');

    try {
      setSaving({ ...saving, new: true });
      const result = await apiFetch(`/admin/divisions/${divisionId}/${assetType}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newAssetName.trim() })
      });

      if (result.ok) {
        setNewAssetName('');
        setSuccessMessage(t('messages.save-success'));
        setErrors({}); // Clear all errors on successful save
        mutate(`/admin/divisions/${divisionId}/${assetType}`);
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setErrors({ new: t('messages.save-error') });
      }
    } catch {
      setErrors({ new: t('messages.save-error') });
    } finally {
      setSaving({ ...saving, new: false });
    }
  };

  const handleSaveAsset = async (assetId: string) => {
    const newName = editingAssets[assetId]?.trim();
    if (!newName) {
      setErrors({ [assetId]: t('messages.validation.name-required') });
      return;
    }

    setErrors({});
    setSuccessMessage('');

    try {
      setSaving({ ...saving, [assetId]: true });
      const result = await apiFetch(`/admin/divisions/${divisionId}/${assetType}/${assetId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName })
      });

      if (result.ok) {
        const newEditingAssets = { ...editingAssets };
        delete newEditingAssets[assetId];
        setEditingAssets(newEditingAssets);

        setSuccessMessage(t('messages.save-success'));
        setErrors({}); // Clear all errors on successful save
        mutate(`/admin/divisions/${divisionId}/${assetType}`);
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setErrors({ [assetId]: t('messages.save-error') });
      }
    } catch {
      setErrors({ [assetId]: t('messages.save-error') });
    } finally {
      setSaving({ ...saving, [assetId]: false });
    }
  };

  const handleDeleteAsset = async (assetId: string) => {
    setErrors({});
    setSuccessMessage('');
    console.log('Deleting asset:', assetId);
    // TODO: Implement DELETE functionality
  };

  const startEditing = (asset: T) => {
    setEditingAssets({ ...editingAssets, [asset.id]: asset.name });
    setErrors({}); // Clear all errors when starting to edit
    setSuccessMessage(''); // Clear success message when starting to edit
  };

  const cancelEditing = (assetId: string) => {
    const newEditingAssets = { ...editingAssets };
    delete newEditingAssets[assetId];
    setEditingAssets(newEditingAssets);
    setErrors({}); // Clear all errors when canceling edit
    setSuccessMessage(''); // Clear success message when canceling edit
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
            startIcon={saving.new ? <CircularProgress size={16} /> : <AddIcon />}
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
          {assets.map(asset => (
            <Box key={asset.id}>
              {isEditing(asset.id) ? (
                <Box>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <TextField
                      size="small"
                      value={editingAssets[asset.id]}
                      onChange={e => {
                        setEditingAssets({ ...editingAssets, [asset.id]: e.target.value });
                        if (errors[asset.id]) {
                          setErrors({ ...errors, [asset.id]: '' });
                        }
                      }}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          handleSaveAsset(asset.id);
                        } else if (e.key === 'Escape') {
                          cancelEditing(asset.id);
                        }
                      }}
                      disabled={saving[asset.id]}
                      error={!!errors[asset.id]}
                      sx={{
                        flexGrow: 1,
                        '& .MuiInputBase-input': {
                          padding: '8.5px 14px' // Match size="small" standard padding
                        }
                      }}
                    />
                    <IconButton
                      size="small"
                      onClick={() => handleSaveAsset(asset.id)}
                      disabled={saving[asset.id]}
                      color="primary"
                    >
                      {saving[asset.id] ? <CircularProgress size={16} /> : <CheckIcon />}
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => cancelEditing(asset.id)}
                      disabled={saving[asset.id]}
                    >
                      <CloseIcon />
                    </IconButton>
                  </Stack>
                  {errors[asset.id] && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                      {errors[asset.id]}
                    </Typography>
                  )}
                </Box>
              ) : (
                <Box>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{
                      px: 2,
                      border: '1px solid',
                      borderColor: errors[asset.id] ? 'error.main' : 'divider',
                      borderRadius: 1,
                      minHeight: '40px', // Match the height of TextField size="small"
                      '&:hover': {
                        backgroundColor: 'action.hover'
                      }
                    }}
                  >
                    <Typography
                      variant="body1"
                      onClick={() => startEditing(asset)}
                      sx={{
                        cursor: 'pointer',
                        flexGrow: 1,
                        userSelect: 'none'
                      }}
                    >
                      {asset.name}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteAsset(asset.id)}
                      color="error"
                      title={t(`${assetType as string}.delete-button`)}
                      disabled
                    >
                      {saving[asset.id] ? <CircularProgress size={16} /> : <DeleteIcon />}
                    </IconButton>
                  </Stack>
                  {errors[asset.id] && (
                    <Typography
                      variant="caption"
                      color="error"
                      sx={{ mt: 0.5, display: 'block', px: 2 }}
                    >
                      {errors[asset.id]}
                    </Typography>
                  )}
                </Box>
              )}
            </Box>
          ))}
        </Stack>
      )}
    </Paper>
  );
};

export default AssetManager;
