'use client';

import { useMemo, useState } from 'react';
import useSWR from 'swr';
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import { Avatar, Box, Chip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useTranslations } from 'next-intl';
import { Team } from '@lems/types/api/admin';
import { UnifiedTeamsSearch } from './unified-teams-search';

// Extended team interface for unified view
interface UnifiedTeam extends Team {
  division: {
    id: string;
    name: string;
    color: string;
  };
}

interface UnifiedTeamsDataGridProps {
  teams: UnifiedTeam[];
  eventId: string;
}

export const UnifiedTeamsDataGrid: React.FC<UnifiedTeamsDataGridProps> = ({
  teams: initialTeams,
  eventId
}) => {
  const t = useTranslations('pages.events.teams.unified');
  const [searchValue, setSearchValue] = useState('');

  const { data: teams } = useSWR<UnifiedTeam[]>(`/admin/events/${eventId}/teams/unified`, {
    fallbackData: initialTeams
  });

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
    },
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
          <Avatar src={params.row.logoUrl || '/assets/default-avatar.svg'} alt={params.row.name}>
            #{params.row.number}
          </Avatar>
        </Box>
      )
    },
    {
      field: 'number',
      headerName: t('columns.number'),
      width: 160,
      align: 'left',
      headerAlign: 'left',
      type: 'number',
      sortable: true,
      valueFormatter: (value: number) => value.toString()
    },
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
          icon={<EditIcon />}
          label="Edit team"
          disabled
          onClick={() => {
            // TODO: Implement edit functionality
            console.log('Edit team:', params.row.id);
          }}
        />,
        <GridActionsCellItem
          key="delete"
          icon={<DeleteIcon />}
          label="Delete team"
          disabled
          onClick={() => {
            // TODO: Implement delete functionality
            console.log('Delete team:', params.row.id);
          }}
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
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 50 }
            },
            sorting: {
              sortModel: [
                { field: 'division', sort: 'asc' },
                { field: 'number', sort: 'asc' }
              ]
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
