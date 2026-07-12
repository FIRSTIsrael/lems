'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@mui/material';
import { Logout } from '@mui/icons-material';
import { apiFetch } from '@lems/shared';
import { useRouter } from '../../../../../../../i18n/navigation';

interface SettingsLogoutButtonProps {
  onClose?: () => void;
}

export const SettingsLogoutButton: React.FC<SettingsLogoutButtonProps> = ({ onClose }) => {
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
        onClose?.();
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

  return (
    <Button
      onClick={handleLogout}
      disabled={isLoading}
      variant="outlined"
      color="error"
      fullWidth
      startIcon={<Logout />}
    >
      {t('logout')}
    </Button>
  );
};
