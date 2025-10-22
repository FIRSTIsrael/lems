'use client';

import { useTranslations } from 'next-intl';
import { useTheme } from '@mui/material/styles';
import { Box, Typography, useMediaQuery, Link, Paper } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';

interface Team {
  id: string;
  number: number;
  name: string;
  affiliation: {
    name: string;
    city: string;
  };
}

interface ScoreData {
  team: Team;
  scores: number[];
  maxScore: number;
}

interface DivisionScoreboardProps {
  data: ScoreData[];
  eventSlug: string;
}

export const DivisionScoreboard: React.FC<DivisionScoreboardProps> = ({ data }) => {
  const t = useTranslations('pages.event');
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  const matches = data[0]?.scores.length ?? 3; // Default to 3 matches

  // Sort teams by max score (descending)
  const sortedData = [...data].sort((a, b) => b.maxScore - a.maxScore);

  const columns: GridColDef<ScoreData>[] = [
    {
      field: 'rank',
      headerName: t('scoreboard.rank'),
      width: isDesktop ? 75 : 50,
      sortable: false,
      valueGetter: (_, row) => {
        return sortedData.findIndex(team => team.team.number === row.team.number) + 1;
      }
    },
    {
      field: 'teamName',
      headerName: t('team'),
      width: isDesktop ? 225 : 120,
      sortable: false,
      renderCell: params => {
        const { team } = params.row;
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
      valueGetter: (_, row) => row.maxScore
    },
    ...Array.from({ length: matches }, (_, index) => ({
      field: `match${index + 1}`,
      headerName: `${t('scoreboard.match')} ${index + 1}`,
      width: isDesktop ? 100 : 70,
      sortable: false,
      valueGetter: (_: never, row: ScoreData) => row.scores[index] || '-'
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
          getRowId={row => row.team.id}
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
