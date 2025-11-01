'use client';

import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useTheme } from '@mui/material/styles';
import { Box, Typography, useMediaQuery, Paper } from '@mui/material';
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

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h2" gutterBottom>
        {t('quick-links.scoreboard')}
      </Typography>
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
    </Paper>
  );
};
