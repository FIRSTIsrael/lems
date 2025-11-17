'use client';

import { useTranslations } from 'next-intl';
import { Box } from '@mui/material';
import { useEvent } from '../../components/event-context';
import { useUser } from '../../../components/user-context';
import { PageHeader } from '../components/page-header';
import { usePageData } from '../../hooks/use-page-data';
import { GET_ROOM_JUDGING_SESSIONS } from './judge.graphql';
import { RoomScheduleTable } from './components/room-schedule-table';

export default function JudgePage() {
  const t = useTranslations('pages.judge');
  const { currentDivision } = useEvent();
  const { roleInfo } = useUser();

  const { data, loading } = usePageData(GET_ROOM_JUDGING_SESSIONS, {
    divisionId: currentDivision.id,
    roomId: roleInfo?.['roomId']
  });

  const sessions = data?.division?.judging.sessions || [];

  return (
    <>
      <PageHeader title={t('page-title')} />

      <Box sx={{ pt: 3 }}>
        <RoomScheduleTable sessions={sessions} loading={loading} />
      </Box>
    </>
  );
}
