'use client';

import { use } from 'react';
import { Box, CircularProgress, Alert, Typography, Stack } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useQuery } from '@apollo/client/react';
import { scoresheet, ScoresheetClauseValue } from '@lems/shared/scoresheet';
import { ExportScoresheetHeader } from './components/export-scoresheet-header';
import { ExportScoresheetMission } from './components/export-scoresheet-mission';
import { GET_SCORESHEETS_QUERY, GET_TEAM_INFO_QUERY } from './graphql/query';
import type { ScoresheetInfo } from './graphql/types';

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
  teamLogoUrl: string | null;
  eventName: string;
  divisionName: string;
  seasonName: string;
  scoresheets: ScoresheetData[];
}

export default function ScoresExportPage({ params: paramsPromise }: ScoresExportPageProps) {
  const params = use(paramsPromise);
  const t = useTranslations('pages.exports.scores');

  const teamSlugUpper = params.teamSlug.toUpperCase();

  const {
    data: teamInfoData,
    loading: teamInfoLoading,
    error: teamInfoError
  } = useQuery(GET_TEAM_INFO_QUERY, {
    variables: {
      eventSlug: params.eventSlug,
      teamSlug: teamSlugUpper
    },
    fetchPolicy: 'no-cache'
  });

  const divisions = teamInfoData?.event?.divisions || [];
  const division = divisions.find(div => div.teams?.length > 0);
  const team = division?.teams?.[0];
  const divisionId = division?.id;
  const teamId = team?.id;

  const teamNotFound = Boolean(teamInfoData?.event && divisions.length > 0 && !team);

  const {
    data: scoresheetsData,
    loading: scoresheetsLoading,
    error: scoresheetsError
  } = useQuery(GET_SCORESHEETS_QUERY, {
    variables: { divisionId: divisionId!, teamId: teamId! },
    skip: Boolean(!divisionId || !teamId || teamNotFound),
    fetchPolicy: 'no-cache'
  });

  const data: ScoresData | null = (() => {
    if (!teamInfoData?.event || !division || !team || !scoresheetsData?.division) {
      return null;
    }

    const scoreTeam = scoresheetsData.division.teams?.[0];
    const dbScoresheets = (scoreTeam?.scoresheets ?? []).filter(Boolean) as ScoresheetInfo[];
    const sortedScoresheets = [...dbScoresheets].sort((a, b) => a.round - b.round);

    const mappedScoresheets: ScoresheetData[] = sortedScoresheets.map(s => {
      const missionsJson = (s.data?.missions ?? {}) as Record<
        string,
        Record<string, ScoresheetClauseValue>
      >;

      const missions: MissionData[] = scoresheet.missions.map(mission => {
        const missionData = missionsJson[mission.id] ?? {};

        return {
          clauses: mission.clauses.map((_, clauseIndex) => ({
            value: missionData[String(clauseIndex)] ?? null
          }))
        };
      });

      return {
        round: s.round,
        missions,
        score: s.data?.score ?? 0
      };
    });

    return {
      teamNumber: Number(team.number),
      teamName: team.name,
      teamLogoUrl: (team as { logoUrl?: string | null }).logoUrl ?? null,
      eventName: teamInfoData.event.name,
      divisionName: division.name,
      seasonName: teamInfoData.event.seasonName ?? '',
      scoresheets: mappedScoresheets
    };
  })();

  const loading = teamInfoLoading || scoresheetsLoading;
  const error = teamInfoError?.message || scoresheetsError?.message || '';

  if (loading) {
    return (
      <Box
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (teamNotFound) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error">{t('no-scores-found')}</Alert>
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
            teamLogoUrl={data.teamLogoUrl}
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
