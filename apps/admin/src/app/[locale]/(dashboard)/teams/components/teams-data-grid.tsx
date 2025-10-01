'use client';

import { useMemo, useState } from 'react';
import useSWR from 'swr';
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import { Avatar, Box, Chip } from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import { useTranslations } from 'next-intl';
import { Team } from '@lems/types/api/admin';
import { TeamsSearch } from './teams-search';

interface TeamsDataGridProps {
  teams: Team[];
}

export const TeamsDataGrid: React.FC<TeamsDataGridProps> = ({ teams: initialTeams }) => {
  const t = useTranslations('pages.teams.list');
  const [searchValue, setSearchValue] = useState('');

  const { data: teams } = useSWR<Team[]>('/admin/teams', {
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

        return numberMatch || nameMatch || affiliationMatch || cityMatch;
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
      field: 'active',
      headerName: t('columns.status'),
      width: 120,
      sortable: true,
      renderCell: params => (
        <Chip
          label={params.row.active ? t('status.active') : t('status.inactive')}
          color={params.row.active ? 'success' : 'default'}
          size="small"
          variant="filled"
        />
      )
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
          icon={<Edit />}
          label="Edit team"
          disabled
          onClick={() => {
            // TODO: Implement edit functionality
            console.log('Edit team:', params.row.id);
          }}
        />,
        <GridActionsCellItem
          key="delete"
          icon={<Delete />}
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
      <TeamsSearch value={searchValue} onChange={setSearchValue} />

      <Box sx={{ flex: 1, width: '100%', minHeight: 0 }}>
        <DataGrid
          rows={filteredTeams}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 50 }
            },
            sorting: {
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
