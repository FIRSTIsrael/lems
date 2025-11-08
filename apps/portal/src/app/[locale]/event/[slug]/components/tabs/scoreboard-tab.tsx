'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useTheme } from '@mui/material/styles';
import {
  Box,
  Typography,
  useMediaQuery,
  Paper,
  Stack,
  Collapse,
  IconButton,
  Chip,
  Divider
} from '@mui/material';
import { ExpandMore, ExpandLess } from '@mui/icons-material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { DivisionScoreboardEntry } from '@lems/types/api/portal';
import { useDivisionData } from '../division-data-context';

export const ScoreboardTab = () => {
  const t = useTranslations('pages.event');

  const params = useParams();
  const eventSlug = params.slug as string;

  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  const { scoreboard: data, teams } = useDivisionData();

  const [expandedTeams, setExpandedTeams] = React.useState<Set<string>>(new Set());

  const numberOfMatches = Math.max(...data.map(entry => entry.scores?.length || 0));
  const sortedData = [...data].sort((a, b) => (a.robotGameRank ?? 0) - (b.robotGameRank ?? 0));

  const columns: GridColDef<DivisionScoreboardEntry>[] = [
    {
      field: 'rank',
      headerName: t('scoreboard.rank'),
      width: isDesktop ? 75 : 50,
      sortable: false,
      valueGetter: (_, row) => {
        return row.robotGameRank ?? '-';
      }
    },
    {
      field: 'teamName',
      headerName: t('team'),
      width: isDesktop ? 225 : 120,
      sortable: false,
      renderCell: params => {
        const team = teams.find(t => t.id === params.row.teamId);
        if (!team) {
          return <Typography color="text.secondary">-</Typography>;
        }
        return (
          <Typography
            component={Link}
            href={`/event/${eventSlug}/team/${team.number}`}
            sx={{
              textDecoration: 'none',
              color: 'text.primary',
              '&:hover': {
                textDecoration: 'underline',
                color: 'primary.main'
              },
              fontWeight: 500
            }}
          >
            {isDesktop ? `${team.name} #${team.number}` : `#${team.number}`}
          </Typography>
        );
      }
    },
    {
      field: 'maxScore',
      headerName: t('scoreboard.best-score'),
      width: isDesktop ? 120 : 80,
      sortable: true,
      valueGetter: (_, row) => row.maxScore || '-'
    },
    ...Array.from({ length: numberOfMatches }, (_, index) => ({
      field: `match${index + 1}`,
      headerName: `${t('scoreboard.match')} ${index + 1}`,
      width: isDesktop ? 100 : 70,
      sortable: false,
      valueGetter: (_: never, row: DivisionScoreboardEntry) => row.scores?.[index] || '-'
    }))
  ];

  const MobileScoreboard = () => {
    if (sortedData.length === 0) {
      return (
        <Box display="flex" alignItems="center" justifyContent="center" py={8}>
          <Typography variant="body1" color="text.secondary">
            {t('scoreboard.no-data')}
          </Typography>
        </Box>
      );
    }

    const toggleTeamExpansion = (teamId: string) => {
      const newExpanded = new Set(expandedTeams);
      if (newExpanded.has(teamId)) {
        newExpanded.delete(teamId);
      } else {
        newExpanded.add(teamId);
      }
      setExpandedTeams(newExpanded);
    };

    return (
      <Stack spacing={1}>
        {sortedData.map(entry => {
          const team = teams.find(t => t.id === entry.teamId);
          if (!team) return null;

          const isExpanded = expandedTeams.has(entry.teamId);
          const rankColor =
            entry.robotGameRank === 1
              ? 'gold'
              : entry.robotGameRank === 2
                ? 'silver'
                : entry.robotGameRank === 3
                  ? '#CD7F32'
                  : '#1976d2';

          return (
            <Paper
              key={entry.teamId}
              sx={{
                bgcolor: 'white',
                border: '1px solid',
                borderColor: 'grey.200'
              }}
            >
              <Box
                onClick={() => toggleTeamExpansion(entry.teamId)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  p: 2,
                  cursor: 'pointer',
                  '&:hover': {
                    bgcolor: 'grey.50'
                  }
                }}
              >
                <Chip
                  label={entry.robotGameRank ?? '-'}
                  size="small"
                  sx={{
                    minWidth: 40,
                    fontWeight: 600,
                    bgcolor:
                      entry.robotGameRank && entry.robotGameRank <= 3 ? rankColor : 'transparent',
                    color: entry.robotGameRank && entry.robotGameRank <= 3 ? 'white' : 'black',
                    border: entry.robotGameRank && entry.robotGameRank <= 3 ? 'none' : 'black',
                    mr: 2
                  }}
                />

                <Box sx={{ flex: 1 }}>
                  <Typography
                    component={Link}
                    href={`/event/${eventSlug}/team/${team.number}`}
                    sx={{
                      textDecoration: 'none',
                      color: 'text.primary',
                      fontWeight: 600,
                      fontSize: '1rem',
                      '&:hover': {
                        color: 'primary.main'
                      }
                    }}
                  >
                    {team.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    #{team.number}
                  </Typography>
                </Box>

                <Box sx={{ textAlign: 'right', mr: 1 }}>
                  <Typography variant="body2" color="text.secondary" fontSize="0.75rem">
                    {t('scoreboard.best-score')}
                  </Typography>
                  <Typography variant="h6" fontWeight={600} color="primary.main">
                    {entry.maxScore ?? '-'}
                  </Typography>
                </Box>

                <IconButton size="small">{isExpanded ? <ExpandLess /> : <ExpandMore />}</IconButton>
              </Box>

              <Collapse in={isExpanded}>
                <Divider />
                <Box sx={{ p: 2, pt: 1 }}>
                  <Typography variant="body2" color="text.secondary" mb={1}>
                    {t('scoreboard.match-scores')}
                  </Typography>
                  <Box display="flex" flexWrap="wrap" gap={1}>
                    {Array.from({ length: numberOfMatches }, (_, index) => {
                      const score = entry.scores?.[index];
                      return (
                        <Box
                          key={index}
                          sx={{
                            minWidth: 60,
                            p: 1,
                            textAlign: 'center',
                            bgcolor: score ? 'rgba(25, 118, 210, 0.3)' : 'grey.100',
                            color: score ? 'primary.main' : 'text.disabled',
                            borderRadius: 1,
                            border: score === entry.maxScore ? '2px solid' : 'none',
                            borderColor: score === entry.maxScore ? 'primary.main' : 'transparent'
                          }}
                        >
                          <Typography variant="caption" display="block" fontSize="0.7rem">
                            {t('scoreboard.match')} {index + 1}
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {score ?? '-'}
                          </Typography>
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
              </Collapse>
            </Paper>
          );
        })}
      </Stack>
    );
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h2" gutterBottom>
        {t('quick-links.scoreboard')}
      </Typography>

      {isDesktop && (
        <Box sx={{ width: '100%' }}>
          <DataGrid
            density="compact"
            rows={sortedData}
            columns={columns}
            getRowId={row => row.teamId}
            slots={{
              noRowsOverlay: () => (
                <Box display="flex" alignItems="center" justifyContent="center" height="100%">
                  <Typography variant="body1">{t('scoreboard.no-data')}</Typography>
                </Box>
              )
            }}
            initialState={{
              sorting: {
                sortModel: [{ field: 'maxScore', sort: 'desc' }]
              },
              pagination: {
                paginationModel: {
                  pageSize: 25
                }
              }
            }}
            sx={{ textAlign: 'left' }}
            disableColumnMenu
            disableRowSelectionOnClick
          />
        </Box>
      )}

      {!isDesktop && <MobileScoreboard />}
    </Paper>
  );
};
