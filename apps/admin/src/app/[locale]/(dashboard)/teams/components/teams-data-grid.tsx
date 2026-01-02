'use client';

import { useMemo, useState } from 'react';
import useSWR from 'swr';
import { DataGrid, GridActionsCell, GridColDef } from '@mui/x-data-grid';
import { Avatar, Box, Chip, useTheme } from '@mui/material';
import { useTranslations } from 'next-intl';
import { Team } from '@lems/types/api/admin';
import { Flag } from '@lems/shared';
import { TeamsSearch } from './teams-search';
import { DeleteTeamButton } from './delete-team-button';
import { UpdateTeamButton } from './update-team-button';

interface TeamsDataGridProps {
  teams: Team[];
}

export const TeamsDataGrid: React.FC<TeamsDataGridProps> = ({ teams: initialTeams }) => {
  const t = useTranslations('pages.teams.list');
  const [searchValue, setSearchValue] = useState('');
  const theme = useTheme();

  const { data: teams } = useSWR<Team[]>('/admin/teams?extraFields=deletable', {
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
        const regionMatch = team.region.toLowerCase().includes(searchLower);

        return numberMatch || nameMatch || affiliationMatch || cityMatch || regionMatch;
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
      width: 160,
      align: 'left',
      headerAlign: 'left',
      type: 'number',
      sortable: true,
      valueFormatter: (value: number) => value.toString()
    },
    {
      field: 'region',
      headerName: t('columns.region'),
      width: 120,
      sortable: true,
      filterable: true,
      renderCell: params => {
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <span>{params.row.region.toUpperCase()}</span>
            <Flag region={params.row.region} size={24} />
          </Box>
        );
      }
    },
    {
      field: 'active',
      headerName: t('columns.status'),
      width: 120,
      sortable: true,
      filterable: true,
      type: 'boolean',
      renderCell: params => (
        <Chip
          label={params.row.active ? t('status.active') : t('status.inactive')}
          color={params.row.active ? 'success' : 'default'}
          size="small"
          variant="filled"
        />
      ),
      valueGetter: (value: boolean) => value,
      filterOperators: [
        {
          label: t('status.active'),
          value: 'isTrue',
          getApplyFilterFn: () => {
            return (value: boolean): boolean => {
              return value === true;
            };
          }
        },
        {
          label: t('status.inactive'),
          value: 'isFalse',
          getApplyFilterFn: () => {
            return (value: boolean): boolean => {
              return value === false;
            };
          }
        }
      ]
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
      renderCell: params => (
        <GridActionsCell {...params}>
          <>
            <UpdateTeamButton team={params.row} />
            <DeleteTeamButton team={params.row} />
          </>
        </GridActionsCell>
      )
    }
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <TeamsSearch value={searchValue} onChange={setSearchValue} />

      <Box sx={{ flex: 1, width: '100%', minHeight: 0 }}>
        <DataGrid
          rows={filteredTeams}
          columns={columns}
          disableVirtualization={theme.direction === 'rtl'} // Workaround for MUI issue with RTL virtualization
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
