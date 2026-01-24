'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useTheme, Tooltip, Box, alpha } from '@mui/material';
import { useFinalDeliberation } from '../../final-deliberation-context';
import type { EnrichedTeam } from '../../types';

export function ChampionsDataGrid() {
  const theme = useTheme();
  const t = useTranslations('pages.deliberations.final.champions');
  const { teams, eligibleTeams, awards } = useFinalDeliberation();

  // Filter and sort teams: eligible for champions, sorted by total rank ascending
  const filteredTeams = useMemo(() => {
    const championsTeamIds = new Set(eligibleTeams['champions']);
    return teams
      .filter(team => championsTeamIds.has(team.id))
      .sort((a, b) => a.ranks.total - b.ranks.total);
  }, [teams, eligibleTeams]);

  // Get selected champion team IDs for highlighting
  const selectedChampionIds = useMemo(
    () => new Set(Object.values(awards.champions)),
    [awards.champions]
  );

  const columns: GridColDef<EnrichedTeam>[] = useMemo(
    () => [
      {
        field: 'teamDisplay',
        headerName: t('table-team'),
        width: 100,
        sortable: false,
        filterable: false,
        renderCell: params => {
          const team = params.row as EnrichedTeam;
          return (
            <Tooltip title={team.name}>
              <Box sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {team.number}
              </Box>
            </Tooltip>
          );
        }
      },
      {
        field: 'innovationProjectRank',
        headerName: t('table-innovation-project-rank'),
        width: 140,
        sortable: false,
        filterable: false,
        align: 'center',
        headerAlign: 'center',
        renderCell: params => params.row.ranks['innovation-project']
      },
      {
        field: 'robotDesignRank',
        headerName: t('table-robot-design-rank'),
        width: 140,
        sortable: false,
        filterable: false,
        align: 'center',
        headerAlign: 'center',
        renderCell: params => params.row.ranks['robot-design']
      },
      {
        field: 'coreValuesRank',
        headerName: t('table-core-values-rank'),
        width: 140,
        sortable: false,
        filterable: false,
        align: 'center',
        headerAlign: 'center',
        renderCell: params => params.row.ranks['core-values']
      },
      {
        field: 'robotGameRank',
        headerName: t('table-robot-game-rank'),
        width: 140,
        sortable: false,
        filterable: false,
        align: 'center',
        headerAlign: 'center',
        renderCell: params => params.row.ranks['robot-game']
      },
      {
        field: 'totalRank',
        headerName: t('table-rank'),
        width: 100,
        sortable: false,
        filterable: false,
        align: 'center',
        headerAlign: 'center',
        cellClassName: 'total-rank-cell',
        renderCell: params => params.row.ranks.total
      }
    ],
    [t]
  );

  return (
    <DataGrid
      rows={filteredTeams}
      columns={columns}
      getRowId={row => row.id}
      density="compact"
      disableRowSelectionOnClick
      hideFooterSelectedRowCount
      hideFooter
      getRowClassName={params => {
        const team = params.row as EnrichedTeam;
        return selectedChampionIds.has(team.id) ? 'selected-champion' : '';
      }}
      sx={{
        width: '100%',
        height: '100%',
        '& .selected-champion': {
          backgroundColor: alpha(theme.palette.success.main, 0.15),
          '&:hover': {
            backgroundColor: alpha(theme.palette.success.main, 0.25)
          }
        },
        '& .total-rank-cell': {
          backgroundColor: alpha(theme.palette.primary.main, 0.1),
          fontWeight: 600,
          '&:hover': {
            backgroundColor: alpha(theme.palette.primary.main, 0.15)
          }
        },
        '& .MuiDataGrid-cell:focus': {
          outline: 'none'
        },
        '& .MuiDataGrid-row:hover': {
          cursor: 'default'
        }
      }}
    />
  );
}
