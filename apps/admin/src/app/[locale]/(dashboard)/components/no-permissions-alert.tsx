'use client';

import { Alert } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useSession } from './session-context';

export default function NoPermissionsAlert() {
  const { permissions } = useSession();
  const t = useTranslations('pages.index');

  if (permissions.length !== 0) return null;

  return (
    <Alert sx={{ maxWidth: 600 }} severity="info">
      {t('alerts.no-permissions')}
    </Alert>
  );
}
