'use client';

import { Suspense, useState, useEffect } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormGroup,
  FormControlLabel,
  Checkbox,
  CircularProgress,
  Alert,
  Typography,
  Box
} from '@mui/material';
import { useTranslations } from 'next-intl';
import useSWR, { mutate } from 'swr';
import { PermissionType } from '@lems/database';
import { AdminUserPermissions, ALL_ADMIN_PERMISSIONS } from '@lems/types/api/admin';
import { apiFetch } from '../../../../../lib/fetch';

interface PermissionsEditorDialogProps {
  open: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
}

interface PermissionsFormProps {
  userId: string;
  onClose: () => void;
}

const PermissionsForm: React.FC<PermissionsFormProps> = ({ userId, onClose }) => {
  const t = useTranslations('pages.users.permissions-dialog');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: userPermissions = [] } = useSWR<AdminUserPermissions>(
    userId ? `/admin/users/permissions/${userId}` : null,
    { suspense: true }
  );

  const [selectedPermissions, setSelectedPermissions] = useState<PermissionType[]>([]);

  const permissionsString = JSON.stringify([...userPermissions].sort());

  useEffect(() => {
    setSelectedPermissions([...userPermissions]);
    setError(null);
  }, [permissionsString]); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePermissionChange = (permission: PermissionType, checked: boolean) => {
    setSelectedPermissions(prev =>
      checked ? [...prev, permission] : prev.filter(p => p !== permission)
    );
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await apiFetch(`/admin/users/permissions/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permissions: selectedPermissions })
      });

      if (!result.ok) {
        const errorData = await result.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update permissions');
      }

      // Refresh both permissions and users list
      await Promise.all([mutate(`/admin/users/permissions/${userId}`), mutate('/admin/users')]);

      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {t('description')}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <FormGroup>
          {ALL_ADMIN_PERMISSIONS.map(permission => (
            <FormControlLabel
              key={permission}
              control={
                <Checkbox
                  checked={selectedPermissions.includes(permission)}
                  onChange={e => handlePermissionChange(permission, e.target.checked)}
                  disabled={isSubmitting}
                />
              }
              label={t(`permissions.${permission.toLowerCase().replace(/_/g, '-')}`)}
            />
          ))}
        </FormGroup>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={isSubmitting}>
          {t('actions.cancel')}
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isSubmitting}
          startIcon={isSubmitting ? <CircularProgress size={20} /> : undefined}
        >
          {isSubmitting ? t('actions.saving') : t('actions.save')}
        </Button>
      </DialogActions>
    </>
  );
};

export const PermissionsEditorDialog: React.FC<PermissionsEditorDialogProps> = ({
  open,
  onClose,
  userId,
  userName
}) => {
  const t = useTranslations('pages.users.permissions-dialog');

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t('title', { userName })}</DialogTitle>

      <ErrorBoundary
        fallback={
          <DialogContent>
            <Alert severity="error">{t('errors.fetch-error')}</Alert>
          </DialogContent>
        }
      >
        <Suspense
          fallback={
            <DialogContent>
              <Box display="flex" justifyContent="center" p={3}>
                <CircularProgress />
              </Box>
            </DialogContent>
          }
        >
          <PermissionsForm userId={userId} onClose={onClose} />
        </Suspense>
      </ErrorBoundary>
    </Dialog>
  );
};
