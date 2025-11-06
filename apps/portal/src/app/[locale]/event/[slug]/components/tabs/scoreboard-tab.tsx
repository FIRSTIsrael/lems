'use client';

import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useTheme } from '@mui/material/styles';
import { 
  Box, 
  Typography, 
  useMediaQuery, 
  Paper, 
  Stack
} from '@mui/material';
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

  // Mobile Scoreboard Component - Grid-like layout
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

    return (
      <Box sx={{ width: '100%', overflowX: 'auto' }}>
        {/* Header Row */}
        <Box
          display="grid"
          gridTemplateColumns={`60px 1fr 80px ${Array.from({ length: numberOfMatches }, () => '60px').join(' ')}`}
          gap={1}
          sx={{
            bgcolor: 'grey.100',
            p: 1,
            borderRadius: '4px 4px 0 0',
            minWidth: 300 + (numberOfMatches * 60)
          }}
        >
          <Typography variant="body2" fontWeight={600} textAlign="center">
            {t('scoreboard.rank')}
          </Typography>
          <Typography variant="body2" fontWeight={600}>
            {t('team')}
          </Typography>
          <Typography variant="body2" fontWeight={600} textAlign="center">
            {t('scoreboard.best-score')}
          </Typography>
          {Array.from({ length: numberOfMatches }, (_, index) => (
            <Typography key={index} variant="body2" fontWeight={600} textAlign="center">
              {t('scoreboard.match')} {index + 1}
            </Typography>
          ))}
        </Box>

        {/* Data Rows */}
        <Stack spacing={0}>
          {sortedData.map((entry, rowIndex) => {
            const team = teams.find(t => t.id === entry.teamId);
            if (!team) return null;

            return (
              <Box
                key={entry.teamId}
                display="grid"
                gridTemplateColumns={`60px 1fr 80px ${Array.from({ length: numberOfMatches }, () => '60px').join(' ')}`}
                gap={1}
                sx={{
                  bgcolor: rowIndex % 2 === 0 ? 'white' : 'grey.50',
                  p: 1,
                  borderBottom: '1px solid',
                  borderColor: 'grey.200',
                  minWidth: 300 + (numberOfMatches * 60),
                  alignItems: 'center'
                }}
              >
                {/* Rank */}
                <Typography variant="body2" fontWeight={500} textAlign="center">
                  {entry.robotGameRank ?? '-'}
                </Typography>

                {/* Team Name */}
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
                    fontWeight: 500,
                    fontSize: '0.875rem',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  #{team.number} {team.name}
                </Typography>

                {/* Best Score */}
                <Typography 
                  variant="body2" 
                  fontWeight={600} 
                  textAlign="center"
                  color="primary.main"
                >
                  {entry.maxScore ?? '-'}
                </Typography>

                {/* Match Scores */}
                {Array.from({ length: numberOfMatches }, (_, index) => {
                  const score = entry.scores?.[index];
                  return (
                    <Typography 
                      key={index}
                      variant="body2" 
                      textAlign="center"
                      color={score ? 'text.primary' : 'text.disabled'}
                    >
                      {score ?? '-'}
                    </Typography>
                  );
                })}
              </Box>
            );
          })}
        </Stack>
      </Box>
    );
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h2" gutterBottom>
        {t('quick-links.scoreboard')}
      </Typography>
      
      {/* Desktop DataGrid */}
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
      
      {/* Mobile Card Layout */}
      {!isDesktop && <MobileScoreboard />}
    </Paper>
  );
};
