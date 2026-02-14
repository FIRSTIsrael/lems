'use client';

import { Box, Alert, Typography, Stack } from '@mui/material';
import { useTranslations } from 'next-intl';
import useSWR from 'swr';
import { scoresheet, ScoresheetClauseValue } from '@lems/shared/scoresheet';
import { useParams } from 'next/navigation';
import { ExportScoresheetHeader } from './components/export-scoresheet-header';
import { ExportScoresheetMission } from './components/export-scoresheet-mission';

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
  teamLogoUrl: string | null;
  eventName: string;
  divisionName: string;
  seasonName: string;
  scoresheets: ScoresheetData[];
}

export default function ScoresExportPage() {
  const t = useTranslations('pages.exports.scores');

  const params = useParams();

  const { data: scoresheetsData } = useSWR<ScoresData>(
    `/lems/export/${params.teamSlug}/${params.eventSlug}/scoresheets`
  );

  if (!scoresheetsData) {
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
      {scoresheetsData.scoresheets.map((scoresheetData, scoresheetIndex) => (
        <Box
          key={scoresheetData.round}
          sx={{
            mb: 4,
            '@media print': {
              pageBreakAfter:
                scoresheetIndex < scoresheetsData.scoresheets.length - 1 ? 'always' : 'auto'
            }
          }}
        >
          <ExportScoresheetHeader
            teamNumber={scoresheetsData.teamNumber}
            teamName={scoresheetsData.teamName}
            eventName={scoresheetsData.eventName}
            divisionName={scoresheetsData.divisionName}
            seasonName={scoresheetsData.seasonName}
            round={scoresheetData.round}
            teamLogoUrl={scoresheetsData.teamLogoUrl}
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
