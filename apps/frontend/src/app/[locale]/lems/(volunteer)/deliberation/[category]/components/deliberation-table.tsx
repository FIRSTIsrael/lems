'use client';

import { useMemo } from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useTheme, alpha, IconButton, Tooltip, Box } from '@mui/material';
import { OpenInNew, Add } from '@mui/icons-material';
import { underscoresToHyphens } from '@lems/shared/utils';
import { JudgingCategory } from '@lems/database';
import { useCategoryDeliberation } from '../deliberation-context';
import type { EnrichedTeam } from '../types';

const FIELD_COLUMN_WIDTH = 60;

export function DeliberationTable() {
  const theme = useTheme();
  const { teams, deliberation, suggestedTeam, picklistTeams, addToPicklist, fieldDisplayLabels } =
    useCategoryDeliberation();

  const pickedTeamIds = useMemo(() => new Set(picklistTeams.map(t => t.id)), [picklistTeams]);
  const hypenatedCategory = underscoresToHyphens(
    deliberation?.category as string
  ) as JudgingCategory;

  const columns: GridColDef<EnrichedTeam>[] = useMemo(
    () => [
      {
        field: 'addToPicklist',
        headerName: '',
        width: 40,
        sortable: false,
        filterable: false,
        renderCell: params => {
          const team = params.row as EnrichedTeam;
          const isPicked = pickedTeamIds.has(team.id);
          return (
            !isPicked && (
              <Tooltip key="add-to-picklist" title="Add to Picklist">
                <IconButton size="small" onClick={() => addToPicklist(team.id)} color="success">
                  <Add fontSize="small" />
                </IconButton>
              </Tooltip>
            )
          );
        }
      },
      {
        field: 'rank',
        headerName: 'Rank',
        width: 100,
        sortable: true,
        filterable: false,

        renderCell: params => params.row.rank || '-'
      },
      {
        field: 'teamDisplay',
        headerName: 'Team',
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
        field: 'room',
        headerName: 'Room',
        width: 60,
        sortable: true,
        filterable: false,
        headerAlign: 'center',
        align: 'center',
        renderCell: params => params.row.room?.name || '-'
      },

      // Rubric field columns
      ...fieldDisplayLabels.map(
        label =>
          ({
            field: label,
            headerName: label,
            width: FIELD_COLUMN_WIDTH,
            sortable: false,
            filterable: false,
            headerAlign: 'center' as const,
            align: 'center' as const,
            renderCell: params => {
              const value = params.row.rubricFields[label];
              return value !== null ? value : '-';
            }
          }) as GridColDef<EnrichedTeam>
      ),

      // GP score columns (only shown for core-values category)
      ...Object.keys(teams[0]?.gpScores ?? {})
        .sort((a, b) => {
          const roundA = parseInt(a.split('-')[1], 10);
          const roundB = parseInt(b.split('-')[1], 10);
          return roundA - roundB;
        })
        .map(
          gpKey =>
            ({
              field: gpKey,
              headerName: gpKey,
              width: FIELD_COLUMN_WIDTH,
              sortable: false,
              filterable: false,
              headerAlign: 'center' as const,
              align: 'center' as const,
              renderCell: params => {
                const value = params.row.gpScores[gpKey];
                return value !== null ? value : '-';
              }
            }) as GridColDef<EnrichedTeam>
        ),
      {
        field: 'totalScore',
        headerName: 'Total',
        width: 100,
        sortable: true,
        filterable: false,
        align: 'center',
        headerAlign: 'center',
        renderCell: params => params.row.scores[hypenatedCategory].toFixed(2)
      },
      {
        field: 'normalizedScore',
        headerName: 'Normalized',
        width: 100,
        sortable: true,
        filterable: false,
        align: 'center',
        headerAlign: 'center',
        renderCell: params => params.row.normalizedScores[hypenatedCategory].toFixed(2)
      },
      {
        field: 'actions',
        type: 'actions',
        headerName: 'Actions',
        width: 80,
        getActions: params => {
          const team = params.row as EnrichedTeam;

          return (
            <Tooltip key="view-rubric" title="View Rubric">
              <IconButton
                href={`/lems/team/${team.slug}/rubric/${hypenatedCategory}`}
                target="_blank"
                size="small"
                color="primary"
              >
                <OpenInNew fontSize="small" />
              </IconButton>
            </Tooltip>
          );
        }
      }
    ],
    [fieldDisplayLabels, teams, pickedTeamIds, addToPicklist, hypenatedCategory]
  );

  return (
    <DataGrid
      rows={teams}
      columns={columns}
      pageSizeOptions={[50]}
      density="compact"
      initialState={{
        pagination: { paginationModel: { page: 0, pageSize: 50 } },
        sorting: { sortModel: [{ field: 'rank', sort: 'asc' }] }
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
