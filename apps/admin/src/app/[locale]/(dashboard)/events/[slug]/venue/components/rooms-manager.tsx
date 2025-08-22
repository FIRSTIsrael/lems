'use client';

import { useState } from 'react';
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
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import { useTranslations } from 'next-intl';
import { useSnackbar } from 'notistack';
import useSWR, { mutate } from 'swr';
import { apiFetch } from '../../../../../../../lib/fetch';

interface Room {
  _id: string;
  name: string;
  divisionId: string;
}

interface RoomsManagerProps {
  divisionId: string;
}

const RoomsManager: React.FC<RoomsManagerProps> = ({ divisionId }) => {
  const t = useTranslations('pages.events.venue.rooms');
  const tMessages = useTranslations('pages.events.venue.messages');
  const { enqueueSnackbar } = useSnackbar();
  const [editingRooms, setEditingRooms] = useState<{ [key: string]: string }>({});
  const [newRoomName, setNewRoomName] = useState('');
  const [saving, setSaving] = useState<{ [key: string]: boolean }>({});

  const {
    data: rooms = [],
    error,
    isLoading
  } = useSWR<Room[]>(
    divisionId ? `/admin/divisions/${divisionId}/rooms` : null,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true
    }
  );

  const handleAddRoom = async () => {
    if (!newRoomName.trim()) {
      enqueueSnackbar(t('validation.name-required'), { variant: 'error' });
      return;
    }

    try {
      setSaving({ ...saving, new: true });
      const result = await apiFetch(`/admin/divisions/${divisionId}/rooms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newRoomName.trim() })
      });

      if (result.ok) {
        setNewRoomName('');
        enqueueSnackbar(tMessages('save-success'), { variant: 'success' });
        mutate(`/admin/divisions/${divisionId}/rooms`);
      } else {
        enqueueSnackbar(tMessages('save-error'), { variant: 'error' });
      }
    } catch {
      enqueueSnackbar(tMessages('save-error'), { variant: 'error' });
    } finally {
      setSaving({ ...saving, new: false });
    }
  };

  const handleSaveRoom = async (roomId: string) => {
    const newName = editingRooms[roomId]?.trim();
    if (!newName) {
      enqueueSnackbar(t('validation.name-required'), { variant: 'error' });
      return;
    }

    try {
      setSaving({ ...saving, [roomId]: true });
      const result = await apiFetch(`/admin/divisions/${divisionId}/rooms/${roomId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName })
      });

      if (result.ok) {
        const newEditingRooms = { ...editingRooms };
        delete newEditingRooms[roomId];
        setEditingRooms(newEditingRooms);
        
        enqueueSnackbar(tMessages('save-success'), { variant: 'success' });
        mutate(`/admin/divisions/${divisionId}/rooms`);
      } else {
        enqueueSnackbar(tMessages('save-error'), { variant: 'error' });
      }
    } catch {
      enqueueSnackbar(tMessages('save-error'), { variant: 'error' });
    } finally {
      setSaving({ ...saving, [roomId]: false });
    }
  };

  const handleDeleteRoom = async (roomId: string) => {
    try {
      setSaving({ ...saving, [roomId]: true });
      const result = await apiFetch(`/admin/divisions/${divisionId}/rooms/${roomId}`, {
        method: 'DELETE'
      });

      if (result.ok) {
        enqueueSnackbar(tMessages('delete-success'), { variant: 'success' });
        mutate(`/admin/divisions/${divisionId}/rooms`);
      } else {
        enqueueSnackbar(tMessages('delete-error'), { variant: 'error' });
      }
    } catch {
      enqueueSnackbar(tMessages('delete-error'), { variant: 'error' });
    } finally {
      setSaving({ ...saving, [roomId]: false });
    }
  };

  const startEditing = (room: Room) => {
    setEditingRooms({ ...editingRooms, [room._id]: room.name });
  };

  const cancelEditing = (roomId: string) => {
    const newEditingRooms = { ...editingRooms };
    delete newEditingRooms[roomId];
    setEditingRooms(newEditingRooms);
  };

  const isEditing = (roomId: string) => roomId in editingRooms;

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
        <Alert severity="error">Failed to load rooms</Alert>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        {t('title')}
      </Typography>

      {/* Add new room */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <TextField
            size="small"
            placeholder={t('name-placeholder')}
            value={newRoomName}
            onChange={e => setNewRoomName(e.target.value)}
            onKeyPress={e => {
              if (e.key === 'Enter') {
                handleAddRoom();
              }
            }}
            disabled={saving.new}
            sx={{ flexGrow: 1 }}
          />
          <Button
            variant="contained"
            startIcon={saving.new ? <CircularProgress size={16} /> : <AddIcon />}
            onClick={handleAddRoom}
            disabled={saving.new}
          >
            {t('add-button')}
          </Button>
        </Stack>
      </Box>

      {/* Room list */}
      {rooms.length === 0 ? (
        <Typography variant="body2" color="text.secondary" textAlign="center" py={4}>
          {t('empty-state')}
        </Typography>
      ) : (
        <Stack spacing={2}>
          {rooms.map(room => (
            <Box key={room._id}>
              {isEditing(room._id) ? (
                <Stack direction="row" spacing={1} alignItems="center">
                  <TextField
                    size="small"
                    value={editingRooms[room._id]}
                    onChange={e => 
                      setEditingRooms({ ...editingRooms, [room._id]: e.target.value })
                    }
                    onKeyPress={e => {
                      if (e.key === 'Enter') {
                        handleSaveRoom(room._id);
                      } else if (e.key === 'Escape') {
                        cancelEditing(room._id);
                      }
                    }}
                    disabled={saving[room._id]}
                    sx={{ flexGrow: 1 }}
                  />
                  <IconButton
                    size="small"
                    onClick={() => handleSaveRoom(room._id)}
                    disabled={saving[room._id]}
                    color="primary"
                  >
                    {saving[room._id] ? <CircularProgress size={16} /> : <SaveIcon />}
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => cancelEditing(room._id)}
                    disabled={saving[room._id]}
                  >
                    ×
                  </IconButton>
                </Stack>
              ) : (
                <Stack 
                  direction="row" 
                  justifyContent="space-between" 
                  alignItems="center"
                  sx={{
                    p: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    '&:hover': {
                      backgroundColor: 'action.hover'
                    }
                  }}
                >
                  <Typography 
                    variant="body1" 
                    onClick={() => startEditing(room)}
                    sx={{ 
                      cursor: 'pointer',
                      flexGrow: 1,
                      userSelect: 'none'
                    }}
                  >
                    {room.name}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => handleDeleteRoom(room._id)}
                    disabled={saving[room._id]}
                    color="error"
                    title={t('delete-button')}
                  >
                    {saving[room._id] ? <CircularProgress size={16} /> : <DeleteIcon />}
                  </IconButton>
                </Stack>
              )}
            </Box>
          ))}
        </Stack>
      )}
    </Paper>
  );
};

export default RoomsManager;
