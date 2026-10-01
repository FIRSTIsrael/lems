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
  Typography,
  FormControlLabel,
  Switch,
  Tooltip
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Check as CheckIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { ColorPicker, EditionBadge, apiFetch } from '@lems/shared';
import { getEdition } from '@lems/shared/edition';
import { hsvaToHex, hexToHsva, HsvaColor } from '@uiw/react-color';
import { Division } from '@lems/types/api/admin';
import { defaultColor } from '../../../../../../../theme';
import { DeleteDivisionDialog } from './delete-division-dialog';

interface DivisionsTableProps {
  divisions: Division[];
  onEditDivision: () => Promise<void>;
}

export const DivisionsTable: React.FC<DivisionsTableProps> = ({ divisions, onEditDivision }) => {
  const t = useTranslations('pages.events.divisions');
  const hasMultipleDivisions = divisions.length > 1;

  const [editingDivision, setEditingDivision] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{
    name: string;
    color: HsvaColor;
    futureEdition: boolean;
  }>({
    name: '',
    color: hexToHsva(defaultColor),
    futureEdition: false
  });
  const [nameError, setNameError] = useState<string>('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [divisionToDelete, setDivisionToDelete] = useState<Division | null>(null);

  const handleEditStart = (division: Division) => {
    setEditingDivision(division.id);
    setEditForm({
      name: division.name,
      color: hexToHsva(division.color),
      futureEdition: division.futureEdition
    });
    setNameError('');
  };

  const handleEditCancel = () => {
    setEditingDivision(null);
    setEditForm({ name: '', color: hexToHsva(defaultColor), futureEdition: false });
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
        color: hsvaToHex(editForm.color),
        ...(editForm.futureEdition !== division.futureEdition
          ? { futureEdition: editForm.futureEdition }
          : {})
      })
    });

    if (result.ok) {
      setEditingDivision(null);
      setEditForm({ name: '', color: hexToHsva(defaultColor), futureEdition: false });
      await onEditDivision();
    }
  };

  const handleDelete = async (division: Division) => {
    setDivisionToDelete(division);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    await onEditDivision();
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setDivisionToDelete(null);
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
                    <>
                      <TextField
                        value={editForm.name}
                        onChange={e => handleNameChange(e.target.value)}
                        variant="outlined"
                        size="small"
                        fullWidth
                        error={!!nameError}
                        helperText={nameError}
                      />
                      <Tooltip title={division.hasSchedule ? t('list.edition-locked-tooltip') : ''}>
                        <span>
                          <FormControlLabel
                            control={
                              <Switch
                                size="small"
                                checked={editForm.futureEdition}
                                disabled={division.hasSchedule}
                                onChange={e =>
                                  setEditForm(prev => ({
                                    ...prev,
                                    futureEdition: e.target.checked
                                  }))
                                }
                              />
                            }
                            label={t('list.future-edition')}
                          />
                        </span>
                      </Tooltip>
                    </>
                  ) : (
                    <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
                      <span>{division.name}</span>
                      <EditionBadge edition={getEdition(division)} />
                    </Stack>
                  )}
                </TableCell>
                <TableCell>
                  {editingDivision === division.id ? (
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2
                      }}
                    >
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
                    <Stack
                      direction="row"
                      sx={{
                        alignItems: 'center',
                        gap: 2
                      }}
                    >
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
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{
                        justifyContent: 'flex-end'
                      }}
                    >
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
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{
                        justifyContent: 'flex-end'
                      }}
                    >
                      <IconButton
                        onClick={() => handleEditStart(division)}
                        color="primary"
                        size="small"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(division)} color="error" size="small">
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
                <Typography
                  variant="body2"
                  sx={{
                    color: 'text.secondary'
                  }}
                >
                  {t('list.alerts.not-enough-divisions')}
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <DeleteDivisionDialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        division={divisionToDelete}
        onDelete={handleDeleteConfirm}
      />
    </TableContainer>
  );
};
