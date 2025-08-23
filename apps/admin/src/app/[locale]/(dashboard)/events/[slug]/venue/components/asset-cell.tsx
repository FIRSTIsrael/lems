'use client';

import { useTranslations } from 'next-intl';
import { Typography, Box, TextField, IconButton, Stack, CircularProgress } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import { JudgingRoom, RobotGameTable } from '@lems/types/api/admin';
import React from 'react';

interface AssetCellProps {
  asset: RobotGameTable | JudgingRoom;
  assetType: 'tables' | 'rooms';
  index: number;
  isEditing: boolean;
  editingValue: string;
  error: string | null;
  disabled?: boolean;
  onChange: (value: string) => void;
  onDelete: () => void;
  onStartEditing: () => void;
  onStopEditing: () => void;
  onSave: () => void;
  setError: (error: string) => void;
}

export const AssetCell: React.FC<AssetCellProps> = ({
  asset,
  assetType,
  index,
  isEditing,
  editingValue,
  error,
  disabled = false,
  onChange,
  onDelete,
  onStartEditing,
  onStopEditing,
  onSave,
  setError
}) => {
  const t = useTranslations(`pages.events.venue`);

  return (
    <Box key={asset.id}>
      <Stack direction="row" spacing={2} alignItems="flex-start">
        <Typography
          variant="h4"
          color="text.secondary"
          sx={{
            minWidth: '24px',
            textAlign: 'center',
            fontWeight: 500,
            pt: 0.25
          }}
        >
          {index + 1}
        </Typography>
        <Box sx={{ flexGrow: 1 }}>
          {isEditing ? (
            <Box>
              <Stack direction="row" spacing={1} alignItems="center">
                <TextField
                  size="small"
                  value={editingValue}
                  onChange={e => {
                    onChange(e.target.value);
                    if (error) {
                      setError('');
                    }
                  }}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      onSave();
                    } else if (e.key === 'Escape') {
                      onStopEditing();
                    }
                  }}
                  disabled={disabled}
                  error={!!error}
                  sx={{
                    flexGrow: 1,
                    '& .MuiInputBase-input': {
                      padding: '8.5px 14px' // Match size="small" standard padding
                    }
                  }}
                />
                <IconButton
                  size="small"
                  onClick={() => onSave()}
                  disabled={disabled}
                  color="primary"
                >
                  {disabled ? <CircularProgress size={16} /> : <CheckIcon />}
                </IconButton>
                <IconButton size="small" onClick={() => onStopEditing()} disabled={disabled}>
                  <CloseIcon />
                </IconButton>
              </Stack>
              {error && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                  {error}
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
                  borderColor: error ? 'error.main' : 'divider',
                  borderRadius: 1,
                  minHeight: '40px', // Match the height of TextField size="small"
                  '&:hover': {
                    backgroundColor: 'action.hover'
                  }
                }}
              >
                <Typography
                  variant="body1"
                  onClick={() => onStartEditing()}
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
                  onClick={() => onDelete()}
                  color="error"
                  title={t(`${assetType}.delete-button`)}
                  disabled
                >
                  {disabled ? <CircularProgress size={16} /> : <DeleteIcon />}
                </IconButton>
              </Stack>
              {error && (
                <Typography
                  variant="caption"
                  color="error"
                  sx={{ mt: 0.5, display: 'block', px: 2 }}
                >
                  {error}
                </Typography>
              )}
            </Box>
          )}
        </Box>
      </Stack>
    </Box>
  );
};
