'use client';

import { useTranslations } from 'next-intl';
import { Box, Typography, useTheme } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import type { ScoreboardTeam } from '../graphql/types';

interface ScoreboardTableProps {
  data: ScoreboardTeam[];
  matchesPerTeam: number;
}

export function ScoreboardTable({ data, matchesPerTeam }: ScoreboardTableProps) {
  const t = useTranslations('pages.reports.scoreboard');
  const theme = useTheme();

  const columns: GridColDef<ScoreboardTeam>[] = [
    {
      field: 'rank',
      headerName: t('rank'),
      width: 90,
      valueGetter: (_, row) => row.rank ?? Infinity,
      renderCell: params => {
        const rank = params.row.rank;
        return rank !== null ? rank : '-';
      }
    },
    {
      field: 'team',
      headerName: t('team'),
      width: 225,
      valueGetter: (_, row) => `${row.name} #${row.number}`,
      renderCell: params => <Typography>{`${params.row.name} #${params.row.number}`}</Typography>
    },
    {
      field: 'maxScore',
      headerName: t('best-score'),
      width: 120,
      valueGetter: (_, row) => row.maxScore ?? -1,
      renderCell: params => (params.row.maxScore !== null ? params.row.maxScore : '-')
    },
    ...Array.from({ length: matchesPerTeam }, (_, index) => ({
      field: `match${index + 1}`,
      headerName: `${t('match')} ${index + 1}`,
      width: 100,
      valueGetter: (_: unknown, row: ScoreboardTeam) => row.scores[index] ?? -1,
      renderCell: (params: { row: ScoreboardTeam }) =>
        params.row.scores[index] !== null ? params.row.scores[index] : '-'
    }))
  ];

  return (
    <Box sx={{ width: '100%' }}>
      <DataGrid
        density="compact"
        rows={data}
        columns={columns}
        disableVirtualization={theme.direction === 'rtl'}
        getRowId={row => row.id}
        slots={{
          noRowsOverlay: () => (
            <Box display="flex" alignItems="center" justifyContent="center" height="100%">
              <Typography variant="body1">{t('no-data')}</Typography>
            </Box>
          )
        }}
        initialState={{
          sorting: {
            sortModel: [{ field: 'rank', sort: 'asc' }]
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
}
