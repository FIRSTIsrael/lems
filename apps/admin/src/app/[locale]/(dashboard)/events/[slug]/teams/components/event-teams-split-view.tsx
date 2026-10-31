'use client';

import { useMemo, useState } from 'react';
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import { Avatar, Box, Chip, Paper, Stack, Tooltip, Typography, useTheme } from '@mui/material';
import { Lock, SwapHoriz } from '@mui/icons-material';
import { useTranslations } from 'next-intl';
import { TeamWithDivision, Division } from '@lems/types/api/admin';
import { getAsset } from '../../../../../../../lib/assets';
import { UnifiedTeamsSearch } from './unified-teams-search';
import { RemoveTeamButton } from './remove-team-button';
import { ChangeDivisionMenu } from './change-division-menu';
import { useChangeTeamDivision } from './use-change-team-division';

interface EventTeamsSplitViewProps {
  teams: TeamWithDivision[];
  divisions: Division[];
  eventId: string;
}

export const EventTeamsSplitView: React.FC<EventTeamsSplitViewProps> = ({
  teams,
  divisions,
  eventId
}) => {
  const t = useTranslations('pages.events.teams');
  const theme = useTheme();
  const [searchValue, setSearchValue] = useState('');
  const {
    selectedTeam,
    anchorEl,
    handleOpenDivisionMenu,
    handleCloseDivisionMenu,
    handleChangeDivision
  } = useChangeTeamDivision(eventId);

  const canChangeDivision =
    divisions.length > 1 && !divisions.some(division => division.hasSchedule);

  const teamsByDivision = useMemo(() => {
    const searchLower = searchValue.trim().toLowerCase();
    const filtered = searchLower
      ? teams.filter(
          team =>
            team.number.toString().includes(searchLower) ||
            team.name.toLowerCase().includes(searchLower) ||
            team.affiliation.toLowerCase().includes(searchLower) ||
            team.city.toLowerCase().includes(searchLower)
        )
      : teams;

    return filtered.reduce(
      (acc, team) => {
        (acc[team.division.id] ??= []).push(team);
        return acc;
      },
      {} as Record<string, TeamWithDivision[]>
    );
  }, [teams, searchValue]);

  const getColumns = (division: Division): GridColDef<TeamWithDivision>[] => [
    {
      field: 'logo',
      headerName: '',
      width: 70,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: params => (
        <Box
          sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}
        >
          <Avatar src={params.row.logoUrl || getAsset('default-avatar.svg')} alt={params.row.name}>
            #{params.row.number}
          </Avatar>
        </Box>
      )
    },
    {
      field: 'number',
      headerName: t('unified.columns.number'),
      width: 80,
      align: 'left',
      headerAlign: 'left',
      type: 'number',
      valueFormatter: (value: number) => value.toString()
    },
    { field: 'name', headerName: t('unified.columns.name'), flex: 1, minWidth: 150 },
    {
      field: 'affiliation',
      headerName: t('unified.columns.affiliation'),
      flex: 1,
      minWidth: 140
    },
    { field: 'city', headerName: t('unified.columns.city'), width: 110 },
    {
      field: 'actions',
      type: 'actions',
      headerName: t('unified.columns.actions'),
      width: canChangeDivision ? 100 : 70,
      sortable: false,
      renderCell: params => (
        <>
          {canChangeDivision && (
            <GridActionsCellItem
              icon={<SwapHoriz />}
              label={t('split.change-division')}
              onClick={e => handleOpenDivisionMenu(e, params.row)}
            />
          )}
          <RemoveTeamButton team={params.row} disabled={division.hasSchedule} />
        </>
      )
    }
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <UnifiedTeamsSearch value={searchValue} onChange={setSearchValue} />

      <Stack direction="row" spacing={2} sx={{ flex: 1, minHeight: 0, overflowX: 'auto', pb: 1 }}>
        {divisions.map(division => {
          const divisionTeams = teamsByDivision[division.id] ?? [];

          return (
            <Paper
              key={division.id}
              variant="outlined"
              sx={{
                flex: 1,
                minWidth: 520,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                borderTop: `4px solid ${division.color}`
              }}
            >
              <Stack
                direction="row"
                spacing={1}
                sx={{
                  alignItems: 'center',
                  px: 2,
                  py: 1.5,
                  borderBottom: 1,
                  borderColor: 'divider'
                }}
              >
                <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: division.color }} />
                <Typography variant="h6" sx={{ fontWeight: 600, flex: 1 }}>
                  {division.name}
                </Typography>
                {division.hasSchedule && (
                  <Tooltip title={t('split.locked')}>
                    <Lock fontSize="small" color="action" />
                  </Tooltip>
                )}
                <Chip size="small" label={t('split.team-count', { count: divisionTeams.length })} />
              </Stack>

              <Box sx={{ flex: 1, minHeight: 0 }}>
                <DataGrid
                  rows={divisionTeams}
                  columns={getColumns(division)}
                  disableVirtualization={theme.direction === 'rtl'} // Workaround for MUI issue with RTL virtualization
                  initialState={{
                    pagination: { paginationModel: { page: 0, pageSize: 50 } },
                    sorting: { sortModel: [{ field: 'number', sort: 'asc' }] }
                  }}
                  pageSizeOptions={[25, 50, 100]}
                  localeText={{ noRowsLabel: t('split.empty') }}
                  disableRowSelectionOnClick
                  disableColumnFilter
                  disableColumnMenu
                  disableColumnSelector
                  sx={{
                    height: '100%',
                    border: 'none',
                    '& .MuiDataGrid-cell:focus': { outline: 'none' },
                    '& .MuiDataGrid-row:hover': { cursor: 'default' },
                    '& .MuiDataGrid-main': { overflow: 'hidden' }
                  }}
                />
              </Box>
            </Paper>
          );
        })}
      </Stack>

      <ChangeDivisionMenu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseDivisionMenu}
        divisions={divisions}
        selectedTeam={selectedTeam}
        onSelectDivision={handleChangeDivision}
      />
    </Box>
  );
};
