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
import { useRoleTranslations } from '@lems/localization';
import { Role } from '../../types';
import { useVolunteer } from './volunteer-context';

interface RoleAssignmentSectionProps {
  role: Role;
  initiallyExpanded?: boolean;
}

export function RoleAssignmentSection({
  role,
  initiallyExpanded = false
}: RoleAssignmentSectionProps) {
  const t = useTranslations('pages.events.users.sections.volunteer-users');
  const { getRole } = useRoleTranslations();
  const {
    divisions,
    getSlotsForRole,
    addSlot,
    removeSlot,
    updateSlotDivisions,
    updateSlotIdentifier,
    needsIdentifiers
  } = useVolunteer();

  const slots = getSlotsForRole(role);
  const singleDivision = divisions.length === 1;
  const [expanded, setExpanded] = useState(true);

  const handleAddSlot = () => {
    addSlot(role);
  };

  const handleRemoveSlot = (slotId: string) => {
    removeSlot(slotId);
  };

  const handleDivisionChange = (slotId: string, newDivisions: string[]) => {
    updateSlotDivisions(slotId, newDivisions);
  };

  const handleIdentifierChange = (slotId: string, identifier: string) => {
    updateSlotIdentifier(slotId, identifier);
  };

  return (
    <Card variant="outlined">
      <CardHeader
        title={getRole(role)}
        titleTypographyProps={{ variant: 'h6' }}
        sx={{ flexWrap: 'wrap' }}
        action={
          <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
            <Typography variant="body2" color="text.secondary">
              {slots.length} {slots.length === 1 ? t('slot') : t('slots')}
            </Typography>
            <Button variant="outlined" startIcon={<AddIcon />} onClick={handleAddSlot} size="small">
              {t('add-slot')}
            </Button>
            {singleDivision ? (
              <IconButton
                color="error"
                onClick={() => slots.forEach(slot => removeSlot(slot.id))}
                aria-label={t('remove-slot')}
                disabled={slots.length === 0}
              >
                <DeleteIcon />
              </IconButton>
            ) : (
              <IconButton
                onClick={() => setExpanded(!expanded)}
                aria-expanded={expanded}
                aria-label="show more"
              >
                {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            )}
          </Stack>
        }
      />
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent sx={{ pt: 0 }}>
          {slots.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
              {t('no-slots-assigned')}
            </Typography>
          ) : (
            <Stack spacing={3}>
              {slots.map(slot => (
                <Stack
                  key={slot.id}
                  direction="row"
                  justifyContent="space-between"
                  alignItems="flex-start"
                  spacing={2}
                  sx={{ minWidth: 0 }}
                >
                  <Stack spacing={2} flex={1} minWidth={0}>
                    {!singleDivision && (
                      <FormControl size="small" fullWidth>
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
                              {(selected as string[]).map(divisionId => {
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
                      <TextField
                        size="small"
                        label={t('identifier')}
                        value={slot.identifier || ''}
                        onChange={e => handleIdentifierChange(slot.id, e.target.value)}
                        fullWidth
                        helperText={t('identifier-help')}
                        slotProps={{ input: { inputProps: { maxLength: 12 } } }}
                      />
                    )}
                  </Stack>

                  <IconButton
                    color="error"
                    onClick={() => handleRemoveSlot(slot.id)}
                    aria-label={t('remove-slot')}
                    sx={{ display: singleDivision ? 'none' : 'flex', flexShrink: 0 }}
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
