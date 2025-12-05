'use client';

import { useTranslations } from 'next-intl';
import { Box } from '@mui/material';
import { useEvent } from '../../components/event-context';
import { useUser } from '../../../components/user-context';
import { PageHeader } from '../components/page-header';

export default function JudgePage() {
  const t = useTranslations('pages.judge');
  const { currentDivision } = useEvent();
  const { roleInfo } = useUser();

  return (
    <>
      <PageHeader title={t('page-title')} />
      <Box sx={{ pt: 3 }}>{/* Stuff goes here */}</Box>
    </>
  );
}
