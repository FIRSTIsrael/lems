'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Paper,
  Box,
  useTheme,
  Typography,
  Chip
} from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import { Flag } from '@lems/shared';
import { sortTeams, getNextSortDirection, SortField, SortDirection } from '../lib/sorting';
import { COLUMN_DEFINITIONS } from '../lib/column-definitions';
import { Team } from '../graphql';

interface DesktopTeamListTableProps {
  teams: Team[];
}

export const DesktopTeamListTable: React.FC<DesktopTeamListTableProps> = ({ teams }) => {
  const t = useTranslations('pages.reports.team-list');
  const theme = useTheme();

  const [sortBy, setSortBy] = useState<SortField>('number');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const sortedTeams = useMemo(() => {
    return sortTeams(teams, sortBy, sortDirection);
  }, [teams, sortBy, sortDirection]);

  const handleSortClick = (field: SortField) => {
    const newDirection = getNextSortDirection(sortBy, sortDirection, field);
    setSortBy(field);
    setSortDirection(newDirection);
  };

  return (
    <>
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer>
          <Table aria-label="team list table">
            <TableHead>
              <TableRow sx={{ backgroundColor: theme.palette.action.hover }}>
                {COLUMN_DEFINITIONS.map(column => (
                  <TableCell
                    key={column.id}
                    align={column.align || 'left'}
                    sx={{ minWidth: column.minWidth }}
                  >
                    {column.sortable ? (
                      <TableSortLabel
                        active={sortBy === column.id}
                        direction={sortBy === column.id ? sortDirection : 'asc'}
                        onClick={() => handleSortClick(column.id)}
                      >
                        {t(column.labelKey)}
                        {sortBy === column.id ? (
                          <Box component="span" sx={visuallyHidden}>
                            {sortDirection === 'desc' ? t('sort-descending') : t('sort-ascending')}
                          </Box>
                        ) : null}
                      </TableSortLabel>
                    ) : (
                      t(column.labelKey)
                    )}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedTeams.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={COLUMN_DEFINITIONS.length} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">{t('no-teams')}</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                sortedTeams.map(team => (
                  <TableRow
                    key={team.id}
                    sx={{
                      '&:last-child td, &:last-child th': { border: 0 },
                      '&:hover': { backgroundColor: theme.palette.action.hover }
                    }}
                  >
                    <TableCell align="center" sx={{ fontWeight: 600 }}>
                      {team.number}
                    </TableCell>
                    <TableCell align="left">{team.name}</TableCell>
                    <TableCell align="left">{team.affiliation}</TableCell>
                    <TableCell align="left">{team.city}</TableCell>
                    <TableCell align="center">
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 1
                        }}
                      >
                        <span>{team.region.toUpperCase()}</span>
                        <Flag region={team.region} size={24} />
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={team.arrived ? t('arrived') : t('not-arrived')}
                        size="small"
                        color={team.arrived ? 'success' : 'default'}
                        variant={team.arrived ? 'filled' : 'outlined'}
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </>
  );
};
