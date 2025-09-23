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
  CircularProgress
} from '@mui/material';
import { useTranslations } from 'next-intl';
import useSWR from 'swr';
import { AdminUser } from '@lems/types/api/admin';
import { apiFetch } from '../../../../../../../lib/fetch';
import { useEvent } from '../../components/event-context';

interface AssignAdminsDialogProps {
  open: boolean;
  onClose?: () => void;
}

export const AssignAdminsDialog: React.FC<AssignAdminsDialogProps> = ({ open, onClose }) => {
  const event = useEvent();
  const t = useTranslations('pages.events.users.dialogs.assignAdmins');

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAdmins, setSelectedAdmins] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const { data: allAdmins = [], isLoading } = useSWR<AdminUser[]>('/admin/users');
  const { data: currentEventAdmins = [], mutate } = useSWR<AdminUser[]>(
    `/admin/events/${event.id}/users/admins`
  );

  const availableAdmins = allAdmins.filter(
    admin => !currentEventAdmins.some(eventAdmin => eventAdmin.id === admin.id)
  );

  const filteredAdmins = availableAdmins.filter(admin =>
    `${admin.firstName} ${admin.lastName} ${admin.username}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const handleClose = () => {
    setSelectedAdmins([]);
    onClose?.();
  };

  const handleToggleAdmin = (adminId: string) => {
    setSelectedAdmins(prev =>
      prev.includes(adminId) ? prev.filter(id => id !== adminId) : [...prev, adminId]
    );
  };

  const handleSave = async () => {
    if (selectedAdmins.length === 0) {
      return;
    }

    setSaving(true);
    try {
      const response = await apiFetch(`/admin/events/${event.id}/users/admins`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminIds: selectedAdmins })
      });

      if (response.ok) {
        mutate();
        handleClose();
      } else {
        console.error('Failed to assign admins');
      }
    } catch (error) {
      console.error('Error assigning admins:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} maxWidth="sm" fullWidth onClose={handleClose}>
      <DialogTitle>{t('title')}</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            placeholder={t('searchPlaceholder')}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            variant="outlined"
            size="small"
          />
        </Box>

        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <CircularProgress />
          </Box>
        )}

        {!isLoading && filteredAdmins.length === 0 && (
          <Alert severity="info">
            {searchTerm ? t('noSearchResults') : t('noAvailableAdmins')}
          </Alert>
        )}

        {!isLoading && (
          <List sx={{ maxHeight: 400, overflow: 'auto' }}>
            {filteredAdmins.map(admin => (
              <ListItem
                key={admin.id}
                onClick={() => {
                  if (saving) return;
                  handleToggleAdmin(admin.id);
                }}
                dense
                sx={{ cursor: 'pointer' }}
              >
                <Checkbox checked={selectedAdmins.includes(admin.id)} />
                <ListItemText
                  primary={`${admin.firstName} ${admin.lastName}`}
                  secondary={`@${admin.username}`}
                />
              </ListItem>
            ))}
          </List>
        )}

        {selectedAdmins.length > 0 && (
          <Typography variant="body2" sx={{ mt: 2 }}>
            {t('selectedCount', { count: selectedAdmins.length })}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          {t('cancel')}
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={selectedAdmins.length === 0 || saving}
        >
          {saving ? <CircularProgress size={20} /> : t('save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
