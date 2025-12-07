'use client';

import { useMemo, useState } from 'react';
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import { Avatar, Box, Chip } from '@mui/material';
import { Edit } from '@mui/icons-material';
import { useTranslations } from 'next-intl';
import { TeamWithDivision, Division } from '@lems/types/api/admin';
import { UnifiedTeamsSearch } from './unified-teams-search';
import { RemoveTeamButton } from './remove-team-button';

interface EventTeamsUnifiedViewProps {
  teams: TeamWithDivision[];
  divisions: Division[];
}

export const EventTeamsUnifiedView: React.FC<EventTeamsUnifiedViewProps> = ({
  teams,
  divisions
}) => {
  const t = useTranslations('pages.events.teams.unified');
  const [searchValue, setSearchValue] = useState('');

  const hasMultipleDivisions = divisions.length > 1;
  const divisionsWithSchedule = new Set(
    divisions.filter(division => division.hasSchedule).map(division => division.id)
  );

  const filteredTeams = useMemo(() => {
    if (!searchValue.trim()) return teams;

    const searchLower = searchValue.toLowerCase();
    return (
      teams?.filter(team => {
        const numberMatch = team.number.toString().includes(searchLower);
        const nameMatch = team.name.toLowerCase().includes(searchLower);
        const affiliationMatch = team.affiliation.toLowerCase().includes(searchLower);
        const cityMatch = team.city.toLowerCase().includes(searchLower);
        const divisionMatch = team.division.name.toLowerCase().includes(searchLower);

        return numberMatch || nameMatch || affiliationMatch || cityMatch || divisionMatch;
      }) || []
    );
  }, [teams, searchValue]);

  const columns: GridColDef[] = [
    {
      field: 'logo',
      headerName: '',
      width: 80,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: params => (
        <Box
          sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}
        >
          <Avatar
            src={params.row.logoUrl || '/admin/assets/default-avatar.svg'}
            alt={params.row.name}
          >
            #{params.row.number}
          </Avatar>
        </Box>
      )
    },
    {
      field: 'number',
      headerName: t('columns.number'),
      width: 80,
      align: 'left',
      headerAlign: 'left',
      type: 'number',
      sortable: true,
      valueFormatter: (value: number) => value.toString()
    },
    ...((hasMultipleDivisions
      ? [
        {
          field: 'division',
          headerName: t('columns.division'),
          width: 140,
          sortable: true,
          renderCell: params => (
            <Chip
              label={params.row.division.name}
              size="small"
              sx={{
                backgroundColor: params.row.division.color,
                color: 'white',
                fontWeight: 'bold',
                '& .MuiChip-label': {
                  px: 1
                }
              }}
            />
          ),
          valueGetter: (value, row) => row.division.name
        }
      ]
      : []) as GridColDef[]),
    {
      field: 'name',
      headerName: t('columns.name'),
      width: 250,
      sortable: true
    },
    {
      field: 'affiliation',
      headerName: t('columns.affiliation'),
      width: 200,
      sortable: true
    },
    {
      field: 'city',
      headerName: t('columns.city'),
      width: 120,
      sortable: true
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: t('columns.actions'),
      width: 120,
      sortable: false,
      getActions: params => [
        <GridActionsCellItem
          key="edit"
          icon={<Edit />}
          label="Edit team"
          // eslint-disable-next-line no-constant-binary-expression
          disabled={true || divisionsWithSchedule.has(params.row.division.id)}
          onClick={() => {
            // TODO: Implement edit functionality
            console.log('Edit team:', params.row.id);
          }}
        />,
        <RemoveTeamButton
          team={params.row}
          disabled={divisionsWithSchedule.has(params.row.division.id)}
        />
      ]
    }
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <UnifiedTeamsSearch value={searchValue} onChange={setSearchValue} />

      <Box sx={{ flex: 1, width: '100%', minHeight: 0 }}>
        <DataGrid
          rows={filteredTeams}
          columns={columns}
          disableVirtualization
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 50 }
            },
            sorting: {
              // We would like to sort this by division and then
              // by number, but the community version of MUI
              // does not support multiple sorts in datagrid :(
              sortModel: [{ field: 'number', sort: 'asc' }]
            }
          }}
          pageSizeOptions={[25, 50, 100]}
          disableRowSelectionOnClick
          disableColumnFilter
          disableColumnMenu
          disableColumnSelector
          sx={{
            height: '100%',
            '& .MuiDataGrid-cell:focus': {
              outline: 'none'
            },
            '& .MuiDataGrid-row:hover': {
              cursor: 'default'
            },
            '& .MuiDataGrid-main': {
              overflow: 'hidden'
            }
          }}
        />
      </Box>
    </Box>
  );
};
