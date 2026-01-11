'use client';

import { useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useQuery } from '@apollo/client/react';
import { Box, CircularProgress, Stack, Typography } from '@mui/material';
import { JudgingCategory } from '@lems/types/judging';
import { RubricExport } from './components/rubric-export';
import { GET_ALL_RUBRICS_EXPORT_QUERY, parseRubricsExportData } from './graphql';

interface ExportPageParams {
  teamSlug: string;
  locale: string;
}

export default function RubricsExportPage() {
  const t = useTranslations();
  const { teamSlug }: Partial<ExportPageParams> = useParams();

  // Extract team ID from slug (assuming slug format: division-id_team-id or similar)
  // For now, we'll use teamSlug as the team ID directly
  // TODO: Update this once you know the actual slug format
  const teamId = teamSlug ?? '';
  const divisionId = 'default-division'; // TODO: Get from context or query params

  const {
    data: rawData,
    loading,
    error
  } = useQuery(GET_ALL_RUBRICS_EXPORT_QUERY, {
    variables: {
      divisionId,
      teamId
    }
  });

  const data = rawData ? parseRubricsExportData(rawData) : undefined;

  // Group rubrics by category (must call before early returns)
  const rubricsByCategory = useMemo(() => {
    if (!data) {
      return {
        'robot-design': [],
        'innovation-project': [],
        'core-values': []
      };
    }

    const grouped: Record<JudgingCategory, (typeof data.rubrics)[0][]> = {
      'robot-design': [],
      'innovation-project': [],
      'core-values': []
    };

    data.rubrics.forEach((rubric: (typeof data.rubrics)[0]) => {
      if (rubric.category in grouped) {
        grouped[rubric.category].push(rubric);
      }
    });

    return grouped;
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
          {t('export.error-loading-rubrics')}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ py: 4 }}>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
        {t('export.rubrics-title', { teamNumber: data.team.number })}
      </Typography>

      <Stack spacing={3}>
        {(['robot-design', 'innovation-project', 'core-values'] as JudgingCategory[]).map(
          category => {
            const rubric = rubricsByCategory[category][0];

            if (!rubric) {
              return (
                <Box key={category}>
                  <Typography variant="body2" color="textSecondary">
                    {t('export.no-rubric', { category })}
                  </Typography>
                </Box>
              );
            }

            return (
              <RubricExport
                key={rubric.id}
                rubric={rubric}
                team={data.team}
                awards={data.awards}
                divisionName="Division" // TODO: Get actual division name
                showFeedback={true}
              />
            );
          }
        )}
      </Stack>
    </Box>
  );
}
