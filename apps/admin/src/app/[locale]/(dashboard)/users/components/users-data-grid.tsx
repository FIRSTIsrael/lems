'use client';

import { useMemo, useState } from 'react';
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import { Avatar, Box } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useTranslations } from 'next-intl';
import { AdminUser } from '@lems/types/api/admin';
import { UsersSearch } from './users-search';

interface UsersDataGridProps {
  users: AdminUser[];
}

export const UsersDataGrid: React.FC<UsersDataGridProps> = ({ users }) => {
  const t = useTranslations('pages.users.list');
  const [searchValue, setSearchValue] = useState('');

  const filteredUsers = useMemo(() => {
    if (!searchValue.trim()) return users;

    const searchLower = searchValue.toLowerCase();
    return users.filter(user => {
      const usernameMatch = user.username.toLowerCase().includes(searchLower);
      const fullNameMatch = `${user.firstName} ${user.lastName}`
        .toLowerCase()
        .includes(searchLower);

      return usernameMatch || fullNameMatch;
    });
  }, [users, searchValue]);

  const getInitial = (firstName: string) => {
    return firstName.charAt(0).toUpperCase();
  };

  const columns: GridColDef[] = [
    {
      field: 'avatar',
      headerName: '',
      width: 80,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: params => (
        <Box
          sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}
        >
          <Avatar sx={{ bgcolor: 'primary.main' }}>{getInitial(params.row.firstName)}</Avatar>
        </Box>
      )
    },

    {
      field: 'name',
      headerName: t('columns.name'),
      width: 250,
      sortable: true,
      valueGetter: (_, row) => `${row.firstName} ${row.lastName}`
    },
    {
      field: 'username',
      headerName: t('columns.username'),
      width: 160,
      sortable: true
    },
    {
      field: 'createdAt',
      headerName: t('columns.createdAt'),
      width: 180,
      sortable: true,
      type: 'date',
      valueGetter: value => new Date(value)
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
          label="Edit user"
          disabled
          onClick={() => {
            // TODO: Implement edit functionality
            console.log('Edit user:', params.row.id);
          }}
        />,
        <GridActionsCellItem
          key="delete"
          icon={<DeleteIcon />}
          label="Delete user"
          disabled
          onClick={() => {
            // TODO: Implement delete functionality
            console.log('Delete user:', params.row.id);
          }}
        />
      ]
    }
  ];

  return (
    <>
      <UsersSearch value={searchValue} onChange={setSearchValue} />

      <Box sx={{ height: '85vh', width: '100%' }}>
        <DataGrid
          rows={filteredUsers}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 10 }
            },
            sorting: {
              sortModel: [{ field: 'createdAt', sort: 'desc' }]
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
    </>
  );
};
