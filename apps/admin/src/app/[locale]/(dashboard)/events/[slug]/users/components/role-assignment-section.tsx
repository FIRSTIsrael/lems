'use client';

import { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Stack,
  Chip,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  Checkbox,
  ListItemText,
  TextField,
  Collapse,
  CardHeader
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from '@mui/icons-material';
import { useTranslations } from 'next-intl';
import { Division } from '@lems/types/api/admin';
import { useRoleTranslations } from '@lems/localization';
import { Role } from '../types';
import { VolunteerSlot } from './volunteer-users-section';

interface RoleAssignmentSectionProps {
  role: Role;
  divisions: Division[];
  slots: VolunteerSlot[];
  onChange: (newSlots: VolunteerSlot[]) => void;
  allSlots: VolunteerSlot[];
  singleDivision: boolean;
  initiallyExpanded?: boolean;
}

export function RoleAssignmentSection({
  role,
  divisions,
  slots,
  onChange,
  allSlots,
  singleDivision,
  initiallyExpanded = false
}: RoleAssignmentSectionProps) {
  const t = useTranslations('pages.events.users.sections.volunteerUsers');
  const { getRole } = useRoleTranslations();
  const [expanded, setExpanded] = useState(initiallyExpanded);

  const handleAddSlot = () => {
    // Generate a simple ID for the new slot
    const newId = `slot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const newSlot: VolunteerSlot = {
      id: newId,
      role,
      divisions: singleDivision && divisions.length > 0 ? [divisions[0].id] : []
    };

    const updatedSlots = [...allSlots, newSlot];
    onChange(updatedSlots);
  };

  const handleRemoveSlot = (slotId: string) => {
    const updatedSlots = allSlots.filter(s => s.id !== slotId);
    onChange(updatedSlots);
  };

  const handleDivisionChange = (slotId: string, newDivisions: string[]) => {
    // Check if "Select All" (empty string) was clicked
    if (newDivisions.includes('')) {
      handleSelectAllDivisions(slotId);
      return;
    }

    const updatedSlots = allSlots.map(slot =>
      slot.id === slotId ? { ...slot, divisions: newDivisions } : slot
    );
    onChange(updatedSlots);
  };

  const handleIdentifierChange = (slotId: string, identifier: string) => {
    const updatedSlots = allSlots.map(slot =>
      slot.id === slotId ? { ...slot, identifier: identifier.slice(0, 12) || undefined } : slot
    );
    onChange(updatedSlots);
  };

  const handleSelectAllDivisions = (slotId: string) => {
    const slot = allSlots.find(s => s.id === slotId);
    if (!slot) return;

    const allDivisionIds = divisions.map(d => d.id);

    // If ANY divisions are selected, deselect all. If NONE are selected, select all.
    const newDivisions = slot.divisions.length > 0 ? [] : allDivisionIds;

    const updatedSlots = allSlots.map(s =>
      s.id === slotId ? { ...s, divisions: newDivisions } : s
    );
    onChange(updatedSlots);
  };

  // Check if duplicates exist for this role per division
  const getDuplicatesForDivision = (divisionId: string) => {
    return slots.filter(slot => slot.divisions.includes(divisionId));
  };

  const needsIdentifiers = (slot: VolunteerSlot) => {
    return slot.divisions.some(divisionId => {
      const duplicatesInDivision = getDuplicatesForDivision(divisionId);
      return duplicatesInDivision.length > 1;
    });
  };

  return (
    <Card variant="outlined">
      <CardHeader
        title={getRole(role)}
        titleTypographyProps={{ variant: 'h6' }}
        action={
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="body2" color="text.secondary">
              {slots.length} {slots.length === 1 ? t('slot') : t('slots')}
            </Typography>
            <Button variant="outlined" startIcon={<AddIcon />} onClick={handleAddSlot} size="small">
              {t('addSlot')}
            </Button>
            <IconButton
              onClick={() => setExpanded(!expanded)}
              aria-expanded={expanded}
              aria-label="show more"
            >
              {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Stack>
        }
      />
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent sx={{ pt: 0 }}>
          {slots.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
              {t('noSlotsAssigned')}
            </Typography>
          ) : (
            <Stack spacing={3}>
              {slots.map(slot => (
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Stack direction="row" spacing={2}>
                    {!singleDivision && (
                      <FormControl size="small" sx={{ mt: 1, minWidth: 200 }}>
                        <InputLabel>{t('divisions')}</InputLabel>
                        <Select
                          multiple
                          value={slot.divisions}
                          onChange={e => handleDivisionChange(slot.id, e.target.value as string[])}
                          input={<OutlinedInput label={t('divisions')} />}
                          MenuProps={{
                            PaperProps: {
                              style: {
                                maxHeight: 300,
                                overflow: 'auto'
                              }
                            }
                          }}
                          renderValue={selected => (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {(selected as string[])
                                .filter(divisionId => divisionId !== '') // Filter out empty strings
                                .map(divisionId => {
                                  const division = divisions.find(d => d.id === divisionId);
                                  return (
                                    <Chip
                                      key={divisionId}
                                      label={division?.name || divisionId}
                                      size="small"
                                      sx={{
                                        backgroundColor: division?.color || '#666',
                                        color: 'white'
                                      }}
                                    />
                                  );
                                })}
                            </Box>
                          )}
                        >
                          {/* Select All Option */}
                          <MenuItem
                            value=""
                            sx={{ borderBottom: '1px solid', borderColor: 'divider' }}
                          >
                            <Checkbox
                              checked={
                                slot.divisions.length === divisions.length &&
                                slot.divisions.length > 0
                              }
                              indeterminate={
                                slot.divisions.length > 0 &&
                                slot.divisions.length < divisions.length
                              }
                            />
                            <ListItemText primary={t('selectAll')} />
                          </MenuItem>
                          {divisions.map(division => (
                            <MenuItem key={division.id} value={division.id}>
                              <Checkbox checked={slot.divisions.includes(division.id)} />
                              <ListItemText primary={division.name} />
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )}

                    {needsIdentifiers(slot) && (
                      <Stack direction="row" alignItems="center" spacing={2} sx={{ mt: 1 }}>
                        <TextField
                          size="small"
                          label={t('identifier')}
                          value={slot.identifier || ''}
                          onChange={e => handleIdentifierChange(slot.id, e.target.value)}
                          sx={{ maxWidth: 200, height: '100%' }}
                          slotProps={{ input: { inputProps: { maxLength: 12 } } }}
                        />
                        <Typography variant="caption" color="text.secondary" maxWidth={200}>
                          {t('identifierHelp')}
                        </Typography>
                      </Stack>
                    )}
                  </Stack>

                  <IconButton
                    color="error"
                    onClick={() => handleRemoveSlot(slot.id)}
                    aria-label={t('removeSlot')}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Stack>
              ))}
            </Stack>
          )}
        </CardContent>
      </Collapse>
    </Card>
  );
}
