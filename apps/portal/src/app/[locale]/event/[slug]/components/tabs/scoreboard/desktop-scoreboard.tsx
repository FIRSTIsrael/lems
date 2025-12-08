'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Box, Typography, useTheme } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { ScoreboardEntry } from '@lems/types/api/portal';

interface DesktopScoreboardProps {
  sortedData: ScoreboardEntry[];
  matchesPerTeam: number;
  eventSlug: string;
}

export const DesktopScoreboard: React.FC<DesktopScoreboardProps> = ({
  sortedData,
  matchesPerTeam,
  eventSlug
}) => {
  const t = useTranslations('pages.event');
  const theme = useTheme();

  const columns: GridColDef<ScoreboardEntry>[] = [
    {
      field: 'rank',
      headerName: t('scoreboard.rank'),
      width: 90,
      sortable: false,
      valueGetter: (_, row) => {
        return row.robotGameRank ?? '-';
      }
    },
    {
      field: 'team',
      headerName: t('team'),
      width: 225,
      sortable: false,
      renderCell: params => {
        return (
          <Typography
            component={Link}
            href={`/event/${eventSlug}/team/${params.row.team.slug}`}
            sx={{
              textDecoration: 'none',
              color: 'text.primary',
              '&:hover': {
                textDecoration: 'underline',
                color: 'primary.main'
              }
            }}
          >
            {`${params.row.team.name} #${params.row.team.number}`}
          </Typography>
        );
      }
    },
    {
      field: 'maxScore',
      headerName: t('scoreboard.best-score'),
      width: 120,
      sortable: false,
      valueGetter: (_, row) => row.maxScore || '-'
    },
    ...Array.from({ length: matchesPerTeam }, (_, index) => ({
      field: `match${index + 1}`,
      headerName: `${t('scoreboard.match')} ${index + 1}`,
      width: 100,
      sortable: false,
      valueGetter: (_: never, row: ScoreboardEntry) => row.scores?.[index] || '-'
    }))
  ];

  return (
    <Box sx={{ width: '100%' }}>
      <DataGrid
        density="compact"
        rows={sortedData}
        columns={columns}
        disableVirtualization={theme.direction === 'rtl'} // Workaround for MUI issue with RTL virtualization
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
            sortModel: [{ field: 'rank', sort: 'desc' }]
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
  );
};
