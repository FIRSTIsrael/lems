'use client';

import { Box } from '@mui/material';
import { useTranslations } from 'next-intl';
import { PageHeader } from '../components/page-header';

interface TournamentManagerLayoutProps {
  children: React.ReactNode;
}

export default function TournamentManagerLayout({ children }: TournamentManagerLayoutProps) {
  const t = useTranslations('pages.tournament-manager');

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <PageHeader title={t('title')} />
      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>{children}</Box>
    </Box>
  );
}
