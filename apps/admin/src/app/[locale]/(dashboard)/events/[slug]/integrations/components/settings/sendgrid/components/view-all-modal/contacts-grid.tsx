'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import { Delete as DeleteIcon } from '@mui/icons-material';

interface Contact {
  team_number: number;
  region: string;
  recipient_email: string;
}

interface ContactsGridProps {
  contacts: Contact[];
  loading: boolean;
  paginationModel: { pageSize: number; page: number };
  onPaginationChange: (model: { pageSize: number; page: number }) => void;
  onDelete: (teamNumber: number) => void;
}

export const ContactsGrid: React.FC<ContactsGridProps> = ({
  contacts,
  loading,
  paginationModel,
  onPaginationChange,
  onDelete
}) => {
  const t = useTranslations('pages.events.integrations.detail-panel.settings.sendgrid');

  const formattedContacts = useMemo(
    () =>
      contacts.map((contact, index) => ({
        ...contact,
        id: `${contact.team_number}-${index}`
      })),
    [contacts]
  );

  const columns: GridColDef[] = [
    {
      field: 'team_number',
      headerName: t('dataGrid-column-team-number') || 'Team Number',
      width: 130,
      sortable: true,
      filterable: true
    },
    {
      field: 'region',
      headerName: t('dataGrid-column-region') || 'Region',
      width: 120,
      sortable: true,
      filterable: true
    },
    {
      field: 'recipient_email',
      headerName: t('dataGrid-column-email') || 'Email',
      flex: 1,
      minWidth: 250,
      sortable: true,
      filterable: true
    },
    {
      field: 'actions',
      type: 'actions',
      width: 80,
      getActions: params => [
        <GridActionsCellItem
          key="delete"
          icon={<DeleteIcon />}
          label="Delete"
          onClick={() => onDelete(params.row.team_number)}
        />
      ]
    }
  ];

  return (
    <DataGrid
      rows={formattedContacts}
      columns={columns}
      paginationModel={paginationModel}
      onPaginationModelChange={onPaginationChange}
      pageSizeOptions={[10, 25, 50]}
      checkboxSelection={false}
      disableRowSelectionOnClick
      density="compact"
      sx={{
        '& .MuiDataGrid-cell': {
          borderColor: 'divider'
        },
        opacity: loading ? 0.5 : 1,
        pointerEvents: loading ? 'none' : 'auto'
      }}
    />
  );
};
