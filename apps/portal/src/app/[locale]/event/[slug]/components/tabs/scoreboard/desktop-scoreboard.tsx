'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Box, Typography } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { DivisionScoreboardEntry, Team } from '@lems/types/api/portal';

interface DesktopScoreboardProps {
  sortedData: DivisionScoreboardEntry[];
  teams: Team[];
  matchesPerTeam: number;
  eventSlug: string;
}

export const DesktopScoreboard: React.FC<DesktopScoreboardProps> = ({
  sortedData,
  teams,
  matchesPerTeam,
  eventSlug
}) => {
  const t = useTranslations('pages.event');

  const columns: GridColDef<DivisionScoreboardEntry>[] = [
    {
      field: 'rank',
      headerName: t('scoreboard.rank'),
      width: 75,
      sortable: false,
      valueGetter: (_, row) => {
        return row.robotGameRank ?? '-';
      }
    },
    {
      field: 'teamName',
      headerName: t('team'),
      width: 225,
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
            {`${team.name} #${team.number}`}
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
      valueGetter: (_: never, row: DivisionScoreboardEntry) => row.scores?.[index] || '-'
    }))
  ];

  return (
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
  );
};
