'use client';

import { mutate } from 'swr';
import { useState, useRef, useEffect } from 'react';
import { Typography, TextField, IconButton, Stack, Box } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { useEvent } from '../../layout';
import { apiFetch } from '../../../../../../../lib/fetch';

export const EditableEventTitle: React.FC = () => {
  const event = useEvent();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(event.name);
  const [nameError, setNameError] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleEditStart = () => {
    setIsEditing(true);
    setEditValue(event.name);
    setNameError('');
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    setEditValue(event.name);
    setNameError('');
  };

  const handleNameChange = (value: string) => {
    setEditValue(value);
    if (nameError) {
      setNameError('');
    }
  };

  const handleEditSave = async () => {
    if (!editValue.trim()) {
      setNameError('Event name is required');
      return;
    }

    setNameError('');

    const result = await apiFetch(`/admin/events/${event.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: editValue.trim()
      })
    });

    if (result.ok) {
      setIsEditing(false);
      mutate(`/admin/events/${event.id}`);
      mutate(`/admin/events`);
    } else {
      setNameError('Failed to update event name');
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleEditSave();
    } else if (event.key === 'Escape') {
      handleEditCancel();
    }
  };

  if (isEditing) {
    return (
      <Box sx={{ mb: 3, position: 'relative' }}>
        <Stack direction="row" spacing={1} alignItems="flex-start">
          <TextField
            inputRef={inputRef}
            value={editValue}
            onChange={e => handleNameChange(e.target.value)}
            onKeyDown={handleKeyDown}
            variant="outlined"
            error={!!nameError}
            helperText={nameError}
            sx={{
              '& .MuiInputBase-input': {
                fontSize: '2rem',
                fontWeight: 800,
                lineHeight: 1.167,
                fontFamily: 'var(--font-heebo),var(--font-roboto)',
                padding: '4px 8px',
                minWidth: '2ch',
                width: `${Math.max(2, editValue.length + 1)}ch`,
                maxWidth: '100%',
                margin: 0,
                border: 'none',
                outline: 'none'
              },
              '& .MuiInputBase-root': {
                borderRadius: '4px',
                backgroundColor: 'rgba(0, 0, 0, 0.02)',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)'
                }
              }
            }}
          />
          <Stack direction="row" spacing={0.5} pt={1.5}>
            <IconButton
              onClick={handleEditSave}
              size="small"
              sx={{
                width: 28,
                height: 28,
                backgroundColor: 'primary.main',
                color: 'primary.contrastText',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  backgroundColor: 'primary.dark',
                  transform: 'scale(1.05)'
                }
              }}
            >
              <CheckIcon fontSize="small" />
            </IconButton>
            <IconButton
              onClick={handleEditCancel}
              size="small"
              sx={{
                width: 28,
                height: 28,
                backgroundColor: 'grey.300',
                color: 'grey.700',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  backgroundColor: 'grey.400',
                  transform: 'scale(1.05)'
                }
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Stack>
      </Box>
    );
  }

  return (
    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 3 }}>
      <Typography
        variant="h1"
        gutterBottom={false}
        onClick={handleEditStart}
        sx={{
          transition: 'all 0.2s ease-in-out',
          borderRadius: '4px',
          padding: '4px 8px',
          margin: '-4px -8px',
          cursor: 'pointer',
          position: 'relative',
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.02)',
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: 0,
              left: '8px',
              right: '8px',
              height: '2px',
              backgroundColor: 'primary.main',
              opacity: 0.3,
              borderRadius: '1px'
            }
          }
        }}
      >
        {event.name}
      </Typography>
      <IconButton
        onClick={handleEditStart}
        size="small"
        sx={{
          width: 28,
          height: 28,
          opacity: 0.5,
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            opacity: 1,
            backgroundColor: 'primary.main',
            color: 'primary.contrastText',
            transform: 'scale(1.05)'
          }
        }}
      >
        <EditIcon fontSize="small" />
      </IconButton>
    </Stack>
  );
};
