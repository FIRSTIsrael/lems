'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  TextField,
  Stack,
  Box,
  Typography
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Check as CheckIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { ColorPicker, apiFetch } from '@lems/shared';
import { hsvaToHex, hexToHsva, HsvaColor } from '@uiw/react-color';
import { Division } from '@lems/types/api/admin';
import { defaultColor } from '../../../../../../../theme';

interface DivisionsTableProps {
  divisions: Division[];
  onEditDivision: () => Promise<void>;
}

export const DivisionsTable: React.FC<DivisionsTableProps> = ({ divisions, onEditDivision }) => {
  const t = useTranslations('pages.events.divisions');
  const hasMultipleDivisions = divisions.length > 1;

  const [editingDivision, setEditingDivision] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ name: string; color: HsvaColor }>({
    name: '',
    color: hexToHsva(defaultColor)
  });
  const [nameError, setNameError] = useState<string>('');

  const handleEditStart = (division: Division) => {
    setEditingDivision(division.id);
    setEditForm({
      name: division.name,
      color: hexToHsva(division.color)
    });
    setNameError('');
  };

  const handleEditCancel = () => {
    setEditingDivision(null);
    setEditForm({ name: '', color: hexToHsva(defaultColor) });
    setNameError('');
  };

  const handleNameChange = (value: string) => {
    setEditForm(prev => ({ ...prev, name: value }));
    if (nameError) {
      setNameError('');
    }
  };

  const handleEditSave = async (division: Division) => {
    if (!editForm.name.trim()) {
      setNameError(t('list.validation.name-required'));
      return;
    }

    setNameError('');

    const result = await apiFetch(`/admin/events/${division.eventId}/divisions/${division.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: editForm.name.trim(),
        color: hsvaToHex(editForm.color)
      })
    });

    if (result.ok) {
      setEditingDivision(null);
      setEditForm({ name: '', color: hexToHsva(defaultColor) });
      await onEditDivision();
    }
  };

  return (
    <TableContainer component={Paper} sx={{ maxWidth: '800px' }}>
      <Table sx={{ tableLayout: 'fixed' }}>
        <TableHead>
          <TableRow>
            <TableCell sx={{ width: '60%' }}>{t('list.columns.name')}</TableCell>
            <TableCell sx={{ width: '30%' }}>{t('list.columns.color')}</TableCell>
            <TableCell sx={{ width: '30%' }} align="right">
              {t('list.columns.actions')}
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {hasMultipleDivisions &&
            divisions.map(division => (
              <TableRow key={division.id}>
                <TableCell>
                  {editingDivision === division.id ? (
                    <TextField
                      value={editForm.name}
                      onChange={e => handleNameChange(e.target.value)}
                      variant="outlined"
                      size="small"
                      fullWidth
                      error={!!nameError}
                      helperText={nameError}
                    />
                  ) : (
                    division.name
                  )}
                </TableCell>
                <TableCell>
                  {editingDivision === division.id ? (
                    <Box display="flex" alignItems="center" gap={2}>
                      <ColorPicker
                        value={editForm.color}
                        onChange={color => setEditForm(prev => ({ ...prev, color }))}
                      >
                        <IconButton
                          sx={{
                            width: 32,
                            height: 32,
                            backgroundColor: hsvaToHex(editForm.color),
                            border: '2px solid',
                            borderColor: 'divider',
                            '&:hover': {
                              backgroundColor: hsvaToHex(editForm.color),
                              opacity: 0.8,
                              transform: 'scale(1.05)'
                            },
                            transition: 'all 0.2s ease-in-out'
                          }}
                        />
                      </ColorPicker>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                        {hsvaToHex(editForm.color)}
                      </Typography>
                    </Box>
                  ) : (
                    <Stack direction="row" alignItems="center" gap={2}>
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          backgroundColor: division.color,
                          borderRadius: '50%',
                          border: '2px solid',
                          borderColor: 'divider'
                        }}
                      />
                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                        {division.color}
                      </Typography>
                    </Stack>
                  )}
                </TableCell>
                <TableCell align="right">
                  {editingDivision === division.id ? (
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <IconButton
                        onClick={() => handleEditSave(division)}
                        color="primary"
                        size="small"
                      >
                        <CheckIcon />
                      </IconButton>
                      <IconButton onClick={handleEditCancel} size="small">
                        <CloseIcon />
                      </IconButton>
                    </Stack>
                  ) : (
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <IconButton
                        onClick={() => handleEditStart(division)}
                        color="primary"
                        size="small"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton disabled color="error" size="small">
                        <DeleteIcon />
                      </IconButton>
                    </Stack>
                  )}
                </TableCell>
              </TableRow>
            ))}
          {!hasMultipleDivisions && (
            <TableRow>
              <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
                <Typography variant="body2" color="text.secondary">
                  {t('list.alerts.not-enough-divisions')}
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
