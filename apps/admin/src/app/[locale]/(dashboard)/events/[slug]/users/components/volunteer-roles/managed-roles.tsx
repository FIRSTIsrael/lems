'use client';

import { useTranslations } from 'next-intl';
import {
  Box,
  Typography,
  Stack,
  Alert,
  FormControlLabel,
  Switch,
  Card,
  CardHeader,
  CardContent
} from '@mui/material';
import { useRoleTranslations } from '@lems/localization';
import { SYSTEM_MANAGED_ROLES, TOGGLEABLE_SYSTEM_ROLES } from '../../types';
import { useVolunteer } from '../volunteer-context';

export const ManagedRolesSection: React.FC = () => {
  const t = useTranslations('pages.events.users.sections.volunteerUsers');
  const { getRole } = useRoleTranslations();
  const { toggledSystemRoles, handleToggleSystemRole } = useVolunteer();

  return (
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Card sx={{ height: 'fit-content' }}>
        <CardHeader
          title={t('systemManagedRoles.title')}
          slotProps={{ title: { variant: 'h6' } }}
        />
        <CardContent>
          <Alert severity="info" sx={{ mb: 2, fontSize: '0.875rem' }}>
            {t('systemManagedRoles.description')}
          </Alert>
          <Stack spacing={1.5}>
            {SYSTEM_MANAGED_ROLES.map(role => (
              <Box
                key={role}
                sx={{
                  p: 1.5,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  bgcolor: 'grey.50'
                }}
              >
                <Typography variant="subtitle2" color="text.secondary">
                  {getRole(role)}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                  {t('systemManagedRoles.roleDescription')}
                </Typography>
              </Box>
            ))}

            {TOGGLEABLE_SYSTEM_ROLES.map(role => (
              <Box
                key={role}
                sx={{
                  p: 1.5,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  bgcolor: 'grey.50'
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box sx={{ flex: 1, mr: 1 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      {getRole(role)}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontStyle: 'italic' }}
                    >
                      {t('systemManagedRoles.toggleableRoleDescription')}
                    </Typography>
                  </Box>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={toggledSystemRoles.has(role)}
                        onChange={e => handleToggleSystemRole(role, e.target.checked)}
                        size="small"
                      />
                    }
                    label=""
                    sx={{ m: 0 }}
                  />
                </Stack>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: 'block', mt: 0.5 }}
                >
                  {toggledSystemRoles.has(role)
                    ? t('systemManagedRoles.enabled')
                    : t('systemManagedRoles.disabled')}
                </Typography>
              </Box>
            ))}
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};
