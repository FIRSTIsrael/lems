'use client';

import { useMemo, useState } from 'react';
import useSWR, { mutate } from 'swr';
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import { Avatar, Box } from '@mui/material';
import { Edit, Security, Delete } from '@mui/icons-material';
import { useTranslations } from 'next-intl';
import { AdminUser } from '@lems/types/api/admin';
import { apiFetch } from '@lems/shared';
import { useSession } from '../../components/session-context';
import { UsersSearch } from './users-search';
import { PermissionsEditorDialog } from './permissions-editor-dialog';
import { DeleteUserDialog } from './delete-user-dialog';

interface UsersDataGridProps {
  users: AdminUser[];
}

export const UsersDataGrid: React.FC<UsersDataGridProps> = ({ users: initialUsers }) => {
  const t = useTranslations('pages.users.list');
  const session = useSession();
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
  const [deleteDialog, setDeleteDialog] = useState<{
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

  const openDeleteDialog = (userId: string, firstName: string, lastName: string) => {
    setDeleteDialog({
      open: true,
      userId,
      userName: `${firstName} ${lastName}`
    });
  };

  const closeDeleteDialog = () => {
    setDeleteDialog({
      open: false,
      userId: '',
      userName: ''
    });
  };

  const handleDeleteUser = async (userId: string) => {
    const result = await apiFetch(`/admin/users/${userId}`, {
      method: 'DELETE'
    });

    if (!result.ok) {
      if (result.status === 403) {
        throw new Error('You cannot delete your own account');
      }
      throw new Error('Failed to delete user');
    }

    mutate('/admin/users');
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
          icon={<Security />}
          label="Edit permissions"
          onClick={() => {
            openPermissionsDialog(params.row.id, params.row.firstName, params.row.lastName);
          }}
        />,
        <GridActionsCellItem
          key="edit"
          icon={<Edit />}
          label="Edit user"
          disabled
          onClick={() => {
            // TODO: Implement edit functionality
            console.log('Edit user:', params.row.id);
          }}
        />,
        <GridActionsCellItem
          key="delete"
          icon={<Delete />}
          label="Delete user"
          disabled={params.row.id === session.user.id}
          onClick={() => {
            openDeleteDialog(params.row.id, params.row.firstName, params.row.lastName);
          }}
        />
      ]
    }
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <UsersSearch value={searchValue} onChange={setSearchValue} />

      <Box sx={{ flex: 1, width: '100%', minHeight: 0 }}>
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

      <PermissionsEditorDialog
        open={permissionsDialog.open}
        onClose={closePermissionsDialog}
        userId={permissionsDialog.userId}
        userName={permissionsDialog.userName}
      />

      <DeleteUserDialog
        open={deleteDialog.open}
        onClose={closeDeleteDialog}
        userId={deleteDialog.userId}
        userName={deleteDialog.userName}
        onDelete={handleDeleteUser}
      />
    </Box>
  );
};
