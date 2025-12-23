'use client';

import { useMemo } from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useTheme, alpha, IconButton, Tooltip } from '@mui/material';
import { OpenInNew, Add } from '@mui/icons-material';
import { useCategoryDeliberation } from '../deliberation-context';
import type { EnrichedTeam } from '../types';

export function DeliberationTable() {
  const theme = useTheme();
  const { teams, suggestedTeam, picklistTeams, addToPicklist } = useCategoryDeliberation();

  const pickedTeamIds = useMemo(() => new Set(picklistTeams.map(t => t.id)), [picklistTeams]);

  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: 'rank',
        headerName: 'Rank',
        width: 60,
        sortable: true,
        filterable: false,
        renderCell: params => params.row.ranks.total || '-'
      },
      {
        field: 'number',
        headerName: 'Team #',
        width: 100,
        sortable: true,
        filterable: false
      },
      {
        field: 'room',
        headerName: 'Room',
        width: 100,
        sortable: true,
        filterable: false,
        renderCell: params => params.row.room?.name || '-'
      },
      {
        field: 'innovationProject',
        headerName: 'Innovation',
        width: 110,
        sortable: true,
        filterable: false,
        renderCell: params => (params.row.normalizedScores['innovation-project'] || 0).toFixed(2)
      },
      {
        field: 'robotDesign',
        headerName: 'Robot Design',
        width: 110,
        sortable: true,
        filterable: false,
        renderCell: params => (params.row.normalizedScores['robot-design'] || 0).toFixed(2)
      },
      {
        field: 'coreValues',
        headerName: 'Core Values',
        width: 110,
        sortable: true,
        filterable: false,
        renderCell: params => (params.row.normalizedScores['core-values'] || 0).toFixed(2)
      },
      {
        field: 'total',
        headerName: 'Total',
        width: 100,
        sortable: true,
        filterable: false,
        renderCell: params => (params.row.normalizedScores.total || 0).toFixed(2)
      },
      {
        field: 'actions',
        type: 'actions',
        headerName: 'Actions',
        width: 80,
        getActions: params => {
          const team = params.row as EnrichedTeam;
          const isPicked = pickedTeamIds.has(team.id);

          return [
            <Tooltip key="view-rubric" title="View Rubric">
              <IconButton size="small" disabled>
                <OpenInNew fontSize="small" />
              </IconButton>
            </Tooltip>,
            !isPicked && team.eligible ? (
              <Tooltip key="add-to-picklist" title="Add to Picklist">
                <IconButton
                  size="small"
                  onClick={() => addToPicklist(team.id)}
                  sx={{ color: theme.palette.success.main }}
                >
                  <Add fontSize="small" />
                </IconButton>
              </Tooltip>
            ) : null
          ].filter(Boolean);
        }
      }
    ],
    [theme, pickedTeamIds, addToPicklist]
  );

  return (
    <DataGrid
      rows={teams}
      columns={columns}
      pageSizeOptions={[50]}
      initialState={{
        pagination: { paginationModel: { page: 0, pageSize: 50 } },
        sorting: { sortModel: [{ field: 'total', sort: 'desc' }] }
      }}
      disableVirtualization={theme.direction === 'rtl'}
      getRowClassName={params => {
        const team = params.row as EnrichedTeam;
        if (suggestedTeam?.id === team.id) {
          return 'suggested-team';
        }
        if (pickedTeamIds.has(team.id)) {
          return 'picked-team';
        }
        return '';
      }}
      sx={{
        width: '100%',
        height: '100%',
        '& .suggested-team': {
          backgroundColor: alpha(theme.palette.warning.main, 0.15),
          '&:hover': {
            backgroundColor: alpha(theme.palette.warning.main, 0.25)
          }
        },
        '& .picked-team': {
          backgroundColor: alpha(theme.palette.primary.main, 0.1),
          '&:hover': {
            backgroundColor: alpha(theme.palette.primary.main, 0.2)
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
