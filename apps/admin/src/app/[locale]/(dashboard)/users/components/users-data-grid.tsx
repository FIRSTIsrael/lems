'use client';

import { useMemo, useState } from 'react';
import useSWR from 'swr';
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import { Avatar, Box } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SecurityIcon from '@mui/icons-material/Security';
import { useTranslations } from 'next-intl';
import { AdminUser } from '@lems/types/api/admin';
import { UsersSearch } from './users-search';
import { PermissionsEditorDialog } from './permissions-editor-dialog';

interface UsersDataGridProps {
  users: AdminUser[];
}

export const UsersDataGrid: React.FC<UsersDataGridProps> = ({ users: initialUsers }) => {
  const t = useTranslations('pages.users.list');
  const [searchValue, setSearchValue] = useState('');
  const [permissionsDialog, setPermissionsDialog] = useState<{
    open: boolean;
    userId: string;
    userName: string;
  }>({
    open: false,
    userId: '',
    userName: ''
  });

  const { data: users } = useSWR<AdminUser[]>('/admin/users', {
    fallbackData: initialUsers
  });

  const filteredUsers = useMemo(() => {
    if (!searchValue.trim()) return users;

    const searchLower = searchValue.toLowerCase();
    return (
      users?.filter(user => {
        const usernameMatch = user.username.toLowerCase().includes(searchLower);
        const fullNameMatch = `${user.firstName} ${user.lastName}`
          .toLowerCase()
          .includes(searchLower);

        return usernameMatch || fullNameMatch;
      }) || []
    );
  }, [users, searchValue]);

  const getInitial = (firstName: string) => {
    return firstName.charAt(0).toUpperCase();
  };

  const openPermissionsDialog = (userId: string, firstName: string, lastName: string) => {
    setPermissionsDialog({
      open: true,
      userId,
      userName: `${firstName} ${lastName}`
    });
  };

  const closePermissionsDialog = () => {
    setPermissionsDialog({
      open: false,
      userId: '',
      userName: ''
    });
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
      width: 160,
      sortable: false,
      getActions: params => [
        <GridActionsCellItem
          key="permissions"
          icon={<SecurityIcon />}
          label="Edit permissions"
          onClick={() => {
            openPermissionsDialog(params.row.id, params.row.firstName, params.row.lastName);
          }}
        />,
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
              paginationModel: { page: 0, pageSize: 50 }
            },
            sorting: {
              sortModel: [{ field: 'createdAt', sort: 'desc' }]
            }
          }}
          pageSizeOptions={[25, 50, 100]}
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

      <PermissionsEditorDialog
        open={permissionsDialog.open}
        onClose={closePermissionsDialog}
        userId={permissionsDialog.userId}
        userName={permissionsDialog.userName}
      />
    </>
  );
};
