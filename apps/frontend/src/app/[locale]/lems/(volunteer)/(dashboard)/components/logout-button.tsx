'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { MenuItem, ListItemIcon, ListItemText, Button } from '@mui/material';
import { Logout } from '@mui/icons-material';
import { apiFetch } from '@lems/shared';
import { useRouter } from '../../../../../../i18n/navigation';

interface LogoutButtonProps {
  variant?: 'menu-item' | 'button';
  onClose?: () => void;
}

export const LogoutButton: React.FC<LogoutButtonProps> = ({ variant = 'menu-item', onClose }) => {
  const router = useRouter();
  const t = useTranslations('components');

  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      const result = await apiFetch('/lems/auth/logout', {
        method: 'POST'
      });

      if (result.ok) {
        // Close any open menus/drawers
        onClose?.();
        // Redirect to homepage
        router.push('/');
      } else {
        console.error('Logout failed:', result.error);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (variant === 'button') {
    return (
      <Button
        onClick={handleLogout}
        disabled={isLoading}
        variant="outlined"
        size="small"
        fullWidth
        startIcon={<Logout />}
      >
        {t('logout')}
      </Button>
    );
  }

  return (
    <MenuItem onClick={handleLogout} disabled={isLoading}>
      <ListItemIcon>
        <Logout fontSize="small" />
      </ListItemIcon>
      <ListItemText>{t('logout')}</ListItemText>
    </MenuItem>
  );
};
