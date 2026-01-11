'use client';

import { useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useQuery } from '@apollo/client/react';
import { Box, CircularProgress, Stack, Typography } from '@mui/material';
import { ScoresheetExport } from './components/scoresheet-export';
import { GET_ALL_SCORESHEETS_EXPORT_QUERY, parseScoresheetsExportData } from './graphql';

interface ExportPageParams {
  teamSlug: string;
  locale: string;
}

export default function ScoresheetsExportPage() {
  const t = useTranslations();
  const { teamSlug }: Partial<ExportPageParams> = useParams();

  // Extract team ID from slug
  const teamId = teamSlug ?? '';
  const divisionId = 'default-division'; // TODO: Get from context or query params

  const {
    data: rawData,
    loading,
    error
  } = useQuery(GET_ALL_SCORESHEETS_EXPORT_QUERY, {
    variables: {
      divisionId,
      teamId
    }
  });

  const data = rawData ? parseScoresheetsExportData(rawData) : undefined;

  // Sort scoresheets by stage and round (must call before early returns)
  const sortedScoresheets = useMemo(() => {
    if (!data) return [];

    return [...data.scoresheets].sort((a, b) => {
      if (a.stage !== b.stage) {
        return a.stage.localeCompare(b.stage);
      }
      return a.round - b.round;
    });
  }, [data]);

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '50vh'
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error || !data) {
    return (
      <Box sx={{ py: 4 }}>
        <Typography color="error" variant="h6">
          {t('export.error-loading-scoresheets')}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ py: 4 }}>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
        {t('export.scoresheets-title', { teamNumber: data.team.number })}
      </Typography>

      {sortedScoresheets.length === 0 ? (
        <Typography variant="body2" color="textSecondary">
          {t('export.no-scoresheets')}
        </Typography>
      ) : (
        <Stack spacing={2}>
          {sortedScoresheets.map(scoresheet => (
            <ScoresheetExport
              key={scoresheet.id}
              scoresheet={scoresheet}
              team={data.team}
              divisionName="Division" // TODO: Get actual division name
            />
          ))}
        </Stack>
      )}
    </Box>
  );
}
