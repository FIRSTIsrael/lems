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

interface Table {
  _id: string;
  name: string;
  divisionId: string;
}

interface TablesManagerProps {
  divisionId: string;
}

const TablesManager: React.FC<TablesManagerProps> = ({ divisionId }) => {
  const t = useTranslations('pages.events.venue.tables');
  const tMessages = useTranslations('pages.events.venue.messages');
  const { enqueueSnackbar } = useSnackbar();
  const [editingTables, setEditingTables] = useState<{ [key: string]: string }>({});
  const [newTableName, setNewTableName] = useState('');
  const [saving, setSaving] = useState<{ [key: string]: boolean }>({});

  const {
    data: tables = [],
    error,
    isLoading
  } = useSWR<Table[]>(
    divisionId ? `/admin/divisions/${divisionId}/tables` : null,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true
    }
  );

  const handleAddTable = async () => {
    if (!newTableName.trim()) {
      enqueueSnackbar(t('validation.name-required'), { variant: 'error' });
      return;
    }

    try {
      setSaving({ ...saving, new: true });
      const result = await apiFetch(`/admin/divisions/${divisionId}/tables`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newTableName.trim() })
      });

      if (result.ok) {
        setNewTableName('');
        enqueueSnackbar(tMessages('save-success'), { variant: 'success' });
        mutate(`/admin/divisions/${divisionId}/tables`);
      } else {
        enqueueSnackbar(tMessages('save-error'), { variant: 'error' });
      }
    } catch {
      enqueueSnackbar(tMessages('save-error'), { variant: 'error' });
    } finally {
      setSaving({ ...saving, new: false });
    }
  };

  const handleSaveTable = async (tableId: string) => {
    const newName = editingTables[tableId]?.trim();
    if (!newName) {
      enqueueSnackbar(t('validation.name-required'), { variant: 'error' });
      return;
    }

    try {
      setSaving({ ...saving, [tableId]: true });
      const result = await apiFetch(`/admin/divisions/${divisionId}/tables/${tableId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName })
      });

      if (result.ok) {
        const newEditingTables = { ...editingTables };
        delete newEditingTables[tableId];
        setEditingTables(newEditingTables);
        
        enqueueSnackbar(tMessages('save-success'), { variant: 'success' });
        mutate(`/admin/divisions/${divisionId}/tables`);
      } else {
        enqueueSnackbar(tMessages('save-error'), { variant: 'error' });
      }
    } catch {
      enqueueSnackbar(tMessages('save-error'), { variant: 'error' });
    } finally {
      setSaving({ ...saving, [tableId]: false });
    }
  };

  const handleDeleteTable = async (tableId: string) => {
    try {
      setSaving({ ...saving, [tableId]: true });
      const result = await apiFetch(`/admin/divisions/${divisionId}/tables/${tableId}`, {
        method: 'DELETE'
      });

      if (result.ok) {
        enqueueSnackbar(tMessages('delete-success'), { variant: 'success' });
        mutate(`/admin/divisions/${divisionId}/tables`);
      } else {
        enqueueSnackbar(tMessages('delete-error'), { variant: 'error' });
      }
    } catch {
      enqueueSnackbar(tMessages('delete-error'), { variant: 'error' });
    } finally {
      setSaving({ ...saving, [tableId]: false });
    }
  };

  const startEditing = (table: Table) => {
    setEditingTables({ ...editingTables, [table._id]: table.name });
  };

  const cancelEditing = (tableId: string) => {
    const newEditingTables = { ...editingTables };
    delete newEditingTables[tableId];
    setEditingTables(newEditingTables);
  };

  const isEditing = (tableId: string) => tableId in editingTables;

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
        <Alert severity="error">Failed to load tables</Alert>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        {t('title')}
      </Typography>

      {/* Add new table */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <TextField
            size="small"
            placeholder={t('name-placeholder')}
            value={newTableName}
            onChange={e => setNewTableName(e.target.value)}
            onKeyPress={e => {
              if (e.key === 'Enter') {
                handleAddTable();
              }
            }}
            disabled={saving.new}
            sx={{ flexGrow: 1 }}
          />
          <Button
            variant="contained"
            startIcon={saving.new ? <CircularProgress size={16} /> : <AddIcon />}
            onClick={handleAddTable}
            disabled={saving.new}
          >
            {t('add-button')}
          </Button>
        </Stack>
      </Box>

      {/* Table list */}
      {tables.length === 0 ? (
        <Typography variant="body2" color="text.secondary" textAlign="center" py={4}>
          {t('empty-state')}
        </Typography>
      ) : (
        <Stack spacing={2}>
          {tables.map(table => (
            <Box key={table._id}>
              {isEditing(table._id) ? (
                <Stack direction="row" spacing={1} alignItems="center">
                  <TextField
                    size="small"
                    value={editingTables[table._id]}
                    onChange={e => 
                      setEditingTables({ ...editingTables, [table._id]: e.target.value })
                    }
                    onKeyPress={e => {
                      if (e.key === 'Enter') {
                        handleSaveTable(table._id);
                      } else if (e.key === 'Escape') {
                        cancelEditing(table._id);
                      }
                    }}
                    disabled={saving[table._id]}
                    sx={{ flexGrow: 1 }}
                  />
                  <IconButton
                    size="small"
                    onClick={() => handleSaveTable(table._id)}
                    disabled={saving[table._id]}
                    color="primary"
                  >
                    {saving[table._id] ? <CircularProgress size={16} /> : <SaveIcon />}
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => cancelEditing(table._id)}
                    disabled={saving[table._id]}
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
                    onClick={() => startEditing(table)}
                    sx={{ 
                      cursor: 'pointer',
                      flexGrow: 1,
                      userSelect: 'none'
                    }}
                  >
                    {table.name}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => handleDeleteTable(table._id)}
                    disabled={saving[table._id]}
                    color="error"
                    title={t('delete-button')}
                  >
                    {saving[table._id] ? <CircularProgress size={16} /> : <DeleteIcon />}
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

export default TablesManager;
