'use client';

import React from 'react';
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import { Avatar, Box } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useTranslations } from 'next-intl';
import { AdminTeamResponse } from '@lems/types/api/admin';

interface TeamsDataGridProps {
  teams: AdminTeamResponse[];
}

export const TeamsDataGrid: React.FC<TeamsDataGridProps> = ({ teams }) => {
  const t = useTranslations('pages.teams.list');

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
          <Avatar src={params.row.logoUrl || undefined} alt={params.row.name}>
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
      sortable: true
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
      width: 300,
      sortable: true,
      valueGetter: (value, row) => {
        if (!row.affiliation) return '';
        return `${row.affiliation.name}, ${row.affiliation.city}`;
      }
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
    <Box sx={{ height: 600, width: '100%' }}>
      <DataGrid
        rows={teams}
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 10 }
          },
          sorting: {
            sortModel: [{ field: 'number', sort: 'asc' }]
          }
        }}
        pageSizeOptions={[5, 10, 25, 50]}
        disableRowSelectionOnClick
        disableColumnFilter
        disableColumnMenu
        disableColumnSelector
        sx={{
          '& .MuiDataGrid-cell:focus': {
            outline: 'none'
          },
          '& .MuiDataGrid-row:hover': {
            cursor: 'default'
          }
        }}
      />
    </Box>
  );
};
