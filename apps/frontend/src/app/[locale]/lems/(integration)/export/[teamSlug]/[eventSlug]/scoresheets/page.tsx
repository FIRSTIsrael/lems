'use client';

import { useEffect, useState } from 'react';
import { Box, CircularProgress, Alert, Typography, Stack } from '@mui/material';
import { useTranslations } from 'next-intl';
import { scoresheet, ScoresheetClauseValue } from '@lems/shared/scoresheet';
import { ExportScoresheetHeader } from './components/export-scoresheet-header';
import { ExportScoresheetMission } from './components/export-scoresheet-mission';

interface ScoresExportPageProps {
  params: Promise<{
    locale: string;
    teamSlug: string;
    eventSlug: string;
  }>;
}

interface MissionData {
  clauses: Array<{ value: ScoresheetClauseValue }>;
}

interface ScoresheetData {
  round: number;
  missions: MissionData[];
  score: number;
}

interface ScoresData {
  teamNumber: number;
  teamName: string;
  eventName: string;
  divisionName: string;
  seasonName: string;
  scoresheets: ScoresheetData[];
}

export default function ScoresExportPage({ params: paramsPromise }: ScoresExportPageProps) {
  const t = useTranslations('pages.exports.scores');
  const [data, setData] = useState<ScoresData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchScores = async () => {
      try {
        const params = await paramsPromise;
        const { eventSlug, teamSlug } = params;
        const response = await fetch(
          `/api/export/scores?eventSlug=${eventSlug}&teamSlug=${teamSlug}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch scores');
        }

        const scoresData: ScoresData = await response.json();
        setData(scoresData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load scores');
      } finally {
        setLoading(false);
      }
    };

    fetchScores();
  }, [paramsPromise]);

  if (loading) {
    return (
      <Box
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!data) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="info">{t('no-scores-found')}</Alert>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        p: 3,
        maxWidth: '800px',
        mx: 'auto',
        '@media print': {
          margin: 0,
          padding: '20px',
          maxWidth: '100%'
        }
      }}
    >
      {data.scoresheets.map((scoresheetData, scoresheetIndex) => (
        <Box
          key={scoresheetData.round}
          sx={{
            mb: 4,
            '@media print': {
              pageBreakAfter: scoresheetIndex < data.scoresheets.length - 1 ? 'always' : 'auto'
            }
          }}
        >
          <ExportScoresheetHeader
            teamNumber={data.teamNumber}
            teamName={data.teamName}
            eventName={data.eventName}
            divisionName={data.divisionName}
            seasonName={data.seasonName}
            round={scoresheetData.round}
          />

          <Stack spacing={1.5}>
            {scoresheet.missions.map((mission, index) => {
              const missionData = scoresheetData.missions[index];
              if (!missionData || !missionData.clauses) return null;

              const score = mission.calculation(
                ...missionData.clauses.map(clause => clause.value ?? false)
              );

              return (
                <ExportScoresheetMission
                  key={mission.id}
                  mission={mission}
                  clauses={missionData.clauses}
                  score={score}
                />
              );
            })}

            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                mt: 2,
                '@media print': {
                  mt: 1
                }
              }}
            >
              <Typography fontSize="1.5rem" fontWeight={700}>
                {t('total-points', { points: scoresheetData.score })}
              </Typography>
            </Box>
          </Stack>
        </Box>
      ))}
    </Box>
  );
}
