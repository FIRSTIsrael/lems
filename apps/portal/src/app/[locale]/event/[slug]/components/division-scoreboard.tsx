'use client';

import { useTranslations } from 'next-intl';
import { useTheme } from '@mui/material/styles';
import { Box, Typography, useMediaQuery, Link, Paper } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { DivisionScoreboardEntry } from '@lems/types/api/portal';
import { useDivisionTeams } from './division-teams-context';

interface DivisionScoreboardProps {
  data?: DivisionScoreboardEntry[];
}

export const DivisionScoreboard: React.FC<DivisionScoreboardProps> = ({ data }) => {
  const t = useTranslations('pages.event');
  const teams = useDivisionTeams();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  if (!data || data.length === 0) {
    return null; // Should only occur while loading
  }

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
          <Link
            href={`/teams/${team.number}`}
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
          </Link>
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
      <Box sx={{ height: 600, width: '100%' }}>
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
