'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  List,
  ListItem,
  ListItemText,
  Checkbox,
  Typography,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  Chip
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { Division } from '@lems/types/api/admin';
import { Role } from '@lems/types';
import { DialogComponentProps } from '../../../../components/dialog-provider';
import { VolunteerAssignment } from './volunteer-users-section';

// Simple ID generator
const generateId = () => `volunteer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Mock volunteer user type for now
interface VolunteerUser {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
}

interface AddVolunteerDialogProps extends DialogComponentProps {
  role: Role;
  divisions: Division[];
  existingAssignments: VolunteerAssignment[];
  onAdd: (assignment: VolunteerAssignment) => void;
  singleDivision: boolean;
}

export const AddVolunteerDialog: React.FC<AddVolunteerDialogProps> = ({
  close,
  role,
  divisions,
  existingAssignments,
  onAdd,
  singleDivision
}) => {
  const t = useTranslations('pages.events.users.dialogs.addVolunteer');

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<VolunteerUser | null>(null);
  const [selectedDivisions, setSelectedDivisions] = useState<string[]>(
    singleDivision && divisions.length > 0 ? [divisions[0].id] : []
  );
  const [identifier, setIdentifier] = useState('');
  const [saving, setSaving] = useState(false);

  // Mock data for volunteer users - in real implementation, this would come from an API
  const [mockVolunteers] = useState<VolunteerUser[]>([
    { id: '1', username: 'volunteer1', firstName: 'John', lastName: 'Doe' },
    { id: '2', username: 'volunteer2', firstName: 'Jane', lastName: 'Smith' },
    { id: '3', username: 'volunteer3', firstName: 'Mike', lastName: 'Johnson' },
    { id: '4', username: 'volunteer4', firstName: 'Sarah', lastName: 'Wilson' }
  ]);

  // Filter volunteers that are not already assigned to this role
  const assignedUserIds = existingAssignments
    .filter(assignment => assignment.role === role)
    .map(assignment => assignment.userId);

  const availableVolunteers = mockVolunteers.filter(
    volunteer => !assignedUserIds.includes(volunteer.id)
  );

  // Filter volunteers based on search term
  const filteredVolunteers = availableVolunteers.filter(volunteer =>
    `${volunteer.firstName} ${volunteer.lastName} ${volunteer.username}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const handleSelectUser = (user: VolunteerUser) => {
    setSelectedUser(user);
    setSearchTerm('');
  };

  const handleDivisionChange = (divisionIds: string[]) => {
    setSelectedDivisions(divisionIds);
  };

  const handleSelectAllDivisions = () => {
    if (selectedDivisions.length === divisions.length) {
      setSelectedDivisions([]);
    } else {
      setSelectedDivisions(divisions.map(d => d.id));
    }
  };

  const handleSave = async () => {
    if (!selectedUser || (selectedDivisions.length === 0 && !singleDivision)) {
      return;
    }

    setSaving(true);

    // Create new assignment
    const newAssignment: VolunteerAssignment = {
      id: generateId(),
      userId: selectedUser.id,
      username: selectedUser.username,
      firstName: selectedUser.firstName,
      lastName: selectedUser.lastName,
      role,
      divisions: singleDivision ? [divisions[0].id] : selectedDivisions,
      identifier: identifier.trim() || undefined
    };

    onAdd(newAssignment);
    setSaving(false);
    close();
  };

  return (
    <Dialog open maxWidth="sm" fullWidth>
      <DialogTitle>{t('title', { role: t(`roles.${role}`) })}</DialogTitle>
      <DialogContent>
        {/* User Selection */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            {t('selectUser')}
          </Typography>

          {selectedUser ? (
            <Box
              sx={{
                p: 2,
                border: 1,
                borderColor: 'primary.main',
                borderRadius: 1,
                bgcolor: 'primary.50'
              }}
            >
              <Typography variant="subtitle1">
                {selectedUser.firstName} {selectedUser.lastName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                @{selectedUser.username}
              </Typography>
              <Button size="small" onClick={() => setSelectedUser(null)} sx={{ mt: 1 }}>
                {t('changeUser')}
              </Button>
            </Box>
          ) : (
            <>
              <TextField
                fullWidth
                placeholder={t('searchPlaceholder')}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                variant="outlined"
                size="small"
                sx={{ mb: 1 }}
              />

              {filteredVolunteers.length === 0 ? (
                <Alert severity="info">
                  {searchTerm ? t('noSearchResults') : t('noAvailableVolunteers')}
                </Alert>
              ) : (
                <List sx={{ maxHeight: 200, overflow: 'auto', border: 1, borderColor: 'divider' }}>
                  {filteredVolunteers.map(volunteer => (
                    <ListItem
                      key={volunteer.id}
                      onClick={() => handleSelectUser(volunteer)}
                      sx={{ cursor: 'pointer' }}
                    >
                      <ListItemText
                        primary={`${volunteer.firstName} ${volunteer.lastName}`}
                        secondary={`@${volunteer.username}`}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </>
          )}
        </Box>

        {/* Division Selection (only if multiple divisions) */}
        {!singleDivision && selectedUser && (
          <Box sx={{ mb: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel>{t('selectDivisions')}</InputLabel>
              <Select
                multiple
                value={selectedDivisions}
                onChange={e => handleDivisionChange(e.target.value as string[])}
                input={<OutlinedInput label={t('selectDivisions')} />}
                renderValue={selected => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {(selected as string[]).map(divisionId => {
                      const division = divisions.find(d => d.id === divisionId);
                      return (
                        <Chip key={divisionId} label={division?.name || divisionId} size="small" />
                      );
                    })}
                  </Box>
                )}
              >
                <MenuItem onClick={handleSelectAllDivisions}>
                  <Checkbox checked={selectedDivisions.length === divisions.length} />
                  <ListItemText primary={t('selectAll')} />
                </MenuItem>
                {divisions.map(division => (
                  <MenuItem key={division.id} value={division.id}>
                    <Checkbox checked={selectedDivisions.includes(division.id)} />
                    <ListItemText primary={division.name} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        )}

        {/* Identifier Field */}
        {selectedUser && (
          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              label={t('identifier')}
              value={identifier}
              onChange={e => setIdentifier(e.target.value.slice(0, 12))}
              helperText={t('identifierHelp')}
              size="small"
              inputProps={{ maxLength: 12 }}
            />
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={close} disabled={saving}>
          {t('cancel')}
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={!selectedUser || (selectedDivisions.length === 0 && !singleDivision) || saving}
        >
          {saving ? <CircularProgress size={20} /> : t('add')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
