'use client';

import { useMemo, useState, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import { apiFetch } from '@lems/shared';
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import { Avatar, Box, Chip, Menu, MenuItem } from '@mui/material';
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
  const theme = useTheme();
  const [searchValue, setSearchValue] = useState('');
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedTeam, setSelectedTeam] = useState<TeamWithDivision | null>(null);
  // local copy for optimistic updates
  const [localTeams, setLocalTeams] = useState<TeamWithDivision[]>(teams);
  useEffect(() => setLocalTeams(teams), [teams]);

  const hasMultipleDivisions = divisions.length > 1;
  const divisionsWithSchedule = new Set(
    divisions.filter(division => division.hasSchedule).map(division => division.id)
  );

  const filteredTeams = useMemo(() => {
    const source = localTeams || teams;
    if (!searchValue.trim()) return source;

    const searchLower = searchValue.toLowerCase();
    return (
      source.filter(team => {
        const numberMatch = team.number.toString().includes(searchLower);
        const nameMatch = team.name.toLowerCase().includes(searchLower);
        const affiliationMatch = team.affiliation.toLowerCase().includes(searchLower);
        const cityMatch = team.city.toLowerCase().includes(searchLower);
        const divisionMatch = team.division.name.toLowerCase().includes(searchLower);

        return numberMatch || nameMatch || affiliationMatch || cityMatch || divisionMatch;
      }) || []
    );
  }, [localTeams, teams, searchValue]);

  const handleChipClick = (event: React.MouseEvent<HTMLElement>, team: TeamWithDivision) => {
    setMenuAnchor(event.currentTarget);
    setSelectedTeam(team);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedTeam(null);
  };

  const handleDivisionChange = async (divisionId: string) => {
    if (!selectedTeam) return;

    try {
      const result = await apiFetch(`/admin/teams/${selectedTeam.id}/division`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ divisionId })
      });

      if (!result.ok) {
        console.error('Server returned error updating division:', result.status, result.error);
        // TODO: show user-facing error/toast
        return;
      }

      // optimistic UI update: update the localTeams array
      const newDivision = divisions.find(d => d.id === divisionId);
      if (newDivision) {
        setLocalTeams(prev =>
          prev.map(t => (t.id === selectedTeam.id ? { ...t, division: newDivision } : t))
        );
      }
    } catch (error) {
      console.error('Network error updating division:', error);
      // TODO: show user-facing error/toast
    } finally {
      handleMenuClose();
    }
  };

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
              <>
                <Chip
                  label={params.row.division.name}
                  size="small"
                  sx={{
                    backgroundColor: params.row.division.color,
                    color: 'white',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    '& .MuiChip-label': {
                      px: 1
                    }
                  }}
                  onClick={event => handleChipClick(event, params.row)}
                />
              </>
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

      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={handleMenuClose}>
        {divisions.map(division => (
          <MenuItem
            key={division.id}
            onClick={() => handleDivisionChange(division.id)}
            disabled={division.id === selectedTeam?.division.id}
          >
            {division.name}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
};
