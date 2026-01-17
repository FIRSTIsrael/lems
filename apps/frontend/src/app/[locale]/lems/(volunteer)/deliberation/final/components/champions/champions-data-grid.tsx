'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useTheme, Tooltip, Box, alpha } from '@mui/material';
import { useJudgingCategoryTranslations } from '@lems/localization';
import { useFinalDeliberation } from '../../final-deliberation-context';
import type { EnrichedTeam } from '../../types';

const FIELD_COLUMN_WIDTH = 150;

export function ChampionsDataGrid() {
  const theme = useTheme();
  const t = useTranslations('pages.deliberations.final.champions');
  const { getCategory } = useJudgingCategoryTranslations();
  const { teams, eligibleTeams, awards } = useFinalDeliberation();

  // Filter and sort teams: eligible for champions, sorted by total rank descending
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
        field: 'rank',
        headerName: t('table-rank'),
        width: 70,
        sortable: false,
        filterable: false,
        align: 'center',
        headerAlign: 'center',
        renderCell: params => params.row.ranks.total || '-'
      },
      {
        field: 'room',
        headerName: t('table-room'),
        width: 70,
        sortable: false,
        filterable: false,
        align: 'center',
        headerAlign: 'center',
        renderCell: params => params.row.room?.name || '-'
      },
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
        field: 'robotDesignScore',
        headerName: getCategory('robot-design'),
        width: FIELD_COLUMN_WIDTH,
        sortable: false,
        filterable: false,
        align: 'center',
        headerAlign: 'center',
        renderCell: params => params.row.scores['robot-design'].toFixed(1)
      },
      {
        field: 'innovationProjectScore',
        headerName: getCategory('innovation-project'),
        width: FIELD_COLUMN_WIDTH,
        sortable: false,
        filterable: false,
        align: 'center',
        headerAlign: 'center',
        renderCell: params => params.row.scores['innovation-project'].toFixed(1)
      },
      {
        field: 'coreValuesScore',
        headerName: getCategory('core-values'),
        width: FIELD_COLUMN_WIDTH,
        sortable: false,
        filterable: false,
        align: 'center',
        headerAlign: 'center',
        renderCell: params => params.row.scores['core-values'].toFixed(1)
      },
      {
        field: 'totalScore',
        headerName: t('table-score'),
        width: 100,
        sortable: false,
        filterable: false,
        align: 'center',
        headerAlign: 'center',
        cellClassName: 'total-score-cell',
        renderCell: params => {
          const total =
            params.row.scores['robot-design'] +
            params.row.scores['innovation-project'] +
            params.row.scores['core-values'];
          return total.toFixed(1);
        }
      }
    ],
    [t, getCategory]
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
        '& .total-score-cell': {
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
