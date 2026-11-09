'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { useTranslations } from 'next-intl';
import { Alert, Box, CircularProgress, Paper, Stack, Typography } from '@mui/material';
import { Division, RobotGameTable } from '@lems/types/api/admin';
import { groupTablesByPair } from '@lems/shared/utils';
import { AddPairForm } from './add-pair-form';
import { TablePairCard } from './table-pair-card';

interface TablePairsManagerProps {
  division: Division;
}

export const TablePairsManager: React.FC<TablePairsManagerProps> = ({ division }) => {
  const t = useTranslations('pages.events.venue');
  const [successMessage, setSuccessMessage] = useState('');

  const basePath = `/admin/events/${division.eventId}/divisions/${division.id}/tables`;

  const {
    data: tables = [],
    error,
    isLoading,
    mutate
  } = useSWR<RobotGameTable[]>(basePath, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true
  });

  const showSuccess = () => {
    setSuccessMessage(t('messages.save-success'));
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  if (isLoading) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <CircularProgress />
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper sx={{ p: 3 }}>
        <Alert severity="error">{t('messages.load-error')}</Alert>
      </Paper>
    );
  }

  const groups = groupTablesByPair(tables);
  const readOnly = division.hasSchedule;

  return (
    <Paper sx={{ p: 3, height: '100%' }}>
      <Typography variant="h6" gutterBottom>
        {t('tables.title')}
      </Typography>
      {!readOnly && (
        <Box sx={{ mb: 3 }}>
          <AddPairForm
            tables={tables}
            basePath={basePath}
            onChanged={() => mutate()}
            onSuccess={showSuccess}
          />
          {successMessage && (
            <Alert severity="success" sx={{ mt: 2 }}>
              {successMessage}
            </Alert>
          )}
        </Box>
      )}
      {groups.length === 0 ? (
        <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', py: 4 }}>
          {t('tables.empty-state')}
        </Typography>
      ) : (
        <>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
            {t('tables.summary', { pairs: groups.length, tables: tables.length })}
          </Typography>
          <Stack spacing={2}>
            {groups.map((group, index) => (
              <TablePairCard
                key={group.key}
                index={index + 1}
                group={group}
                groups={groups}
                basePath={basePath}
                readOnly={readOnly}
                onChanged={() => mutate()}
                onSuccess={showSuccess}
              />
            ))}
          </Stack>
        </>
      )}
    </Paper>
  );
};
