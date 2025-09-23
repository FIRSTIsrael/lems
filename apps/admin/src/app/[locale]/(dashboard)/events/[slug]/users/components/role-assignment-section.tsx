'use client';

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
  TextField
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useTranslations } from 'next-intl';
import { Division } from '@lems/types/api/admin';
import { Role } from '@lems/types';
import { useDialog } from '../../../../components/dialog-provider';
import { VolunteerAssignment } from './volunteer-users-section';
import { AddVolunteerDialog } from './add-volunteer-dialog';

interface RoleAssignmentSectionProps {
  role: Role;
  divisions: Division[];
  assignments: VolunteerAssignment[];
  onChange: (newAssignments: VolunteerAssignment[]) => void;
  allAssignments: VolunteerAssignment[];
  singleDivision: boolean;
}

export function RoleAssignmentSection({
  role,
  divisions,
  assignments,
  onChange,
  allAssignments,
  singleDivision
}: RoleAssignmentSectionProps) {
  const t = useTranslations('pages.events.users.sections.volunteerUsers');
  const { showDialog } = useDialog();

  const handleAddVolunteer = () => {
    showDialog(props => (
      <AddVolunteerDialog
        {...props}
        role={role}
        divisions={divisions}
        existingAssignments={allAssignments}
        onAdd={(newAssignment: VolunteerAssignment) => {
          const updatedAssignments = [...allAssignments, newAssignment];
          onChange(updatedAssignments);
        }}
        singleDivision={singleDivision}
      />
    ));
  };

  const handleRemoveVolunteer = (assignmentId: string) => {
    const updatedAssignments = allAssignments.filter(a => a.id !== assignmentId);
    onChange(updatedAssignments);
  };

  const handleDivisionChange = (assignmentId: string, newDivisions: string[]) => {
    const updatedAssignments = allAssignments.map(assignment =>
      assignment.id === assignmentId ? { ...assignment, divisions: newDivisions } : assignment
    );
    onChange(updatedAssignments);
  };

  const handleIdentifierChange = (assignmentId: string, identifier: string) => {
    const updatedAssignments = allAssignments.map(assignment =>
      assignment.id === assignmentId
        ? { ...assignment, identifier: identifier.slice(0, 12) }
        : assignment
    );
    onChange(updatedAssignments);
  };

  // Check if duplicates exist for this role per division
  const getDuplicatesForDivision = (divisionId: string) => {
    return assignments.filter(assignment => assignment.divisions.includes(divisionId));
  };

  const needsIdentifiers = (assignment: VolunteerAssignment) => {
    return assignment.divisions.some(divisionId => {
      const duplicatesInDivision = getDuplicatesForDivision(divisionId);
      return duplicatesInDivision.length > 1;
    });
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h6">{t(`roles.${role}`)}</Typography>
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={handleAddVolunteer}
          size="small"
        >
          {t('addVolunteer')}
        </Button>
      </Stack>

      {assignments.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
          {t('noVolunteersAssigned')}
        </Typography>
      ) : (
        <Stack spacing={2}>
          {assignments.map(assignment => (
            <Card key={assignment.id} variant="outlined">
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1">
                      {assignment.firstName} {assignment.lastName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      @{assignment.username}
                    </Typography>

                    {/* Division Selection (only show if multiple divisions) */}
                    {!singleDivision && (
                      <FormControl size="small" sx={{ mt: 1, minWidth: 200 }}>
                        <InputLabel>{t('divisions')}</InputLabel>
                        <Select
                          multiple
                          value={assignment.divisions}
                          onChange={e =>
                            handleDivisionChange(assignment.id, e.target.value as string[])
                          }
                          input={<OutlinedInput label={t('divisions')} />}
                          renderValue={selected => (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {(selected as string[]).map(divisionId => {
                                const division = divisions.find(d => d.id === divisionId);
                                return (
                                  <Chip
                                    key={divisionId}
                                    label={division?.name || divisionId}
                                    size="small"
                                  />
                                );
                              })}
                            </Box>
                          )}
                        >
                          <MenuItem value="">
                            <Checkbox checked={assignment.divisions.length === divisions.length} />
                            <ListItemText primary={t('selectAll')} />
                          </MenuItem>
                          {divisions.map(division => (
                            <MenuItem key={division.id} value={division.id}>
                              <Checkbox checked={assignment.divisions.includes(division.id)} />
                              <ListItemText primary={division.name} />
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )}

                    {/* Identifier Field (show if duplicates exist) */}
                    {needsIdentifiers(assignment) && (
                      <TextField
                        size="small"
                        label={t('identifier')}
                        value={assignment.identifier || ''}
                        onChange={e => handleIdentifierChange(assignment.id, e.target.value)}
                        helperText={t('identifierHelp')}
                        sx={{ mt: 1, maxWidth: 200 }}
                        inputProps={{ maxLength: 12 }}
                      />
                    )}

                    {/* Show assigned divisions as chips */}
                    {!singleDivision && assignment.divisions.length > 0 && (
                      <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                        {assignment.divisions.map(divisionId => {
                          const division = divisions.find(d => d.id === divisionId);
                          return (
                            <Chip
                              key={divisionId}
                              label={division?.name || divisionId}
                              size="small"
                              variant="outlined"
                            />
                          );
                        })}
                      </Stack>
                    )}
                  </Box>

                  <IconButton
                    color="error"
                    onClick={() => handleRemoveVolunteer(assignment.id)}
                    aria-label={t('removeVolunteer')}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Box>
  );
}
