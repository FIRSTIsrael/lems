'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { groupTablesByPair } from '@lems/shared/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import type { Match, Scoresheet, Table as TableType } from '../../graphql/types';
import { useHeadRefereeData } from '../head-referee-context';
import { MatchRow } from './match-row';

interface DesktopScheduleTableProps {
  matches: Match[];
  scoresheets: Scoresheet[];
}

export function DesktopScheduleTable({ matches, scoresheets }: DesktopScheduleTableProps) {
  const t = useTranslations('pages.head-referee');
  const { data, currentMatch, findScoresheetForTeam, filterOptions } = useHeadRefereeData();

  // Sort matches by scheduled time
  const sortedMatches = useMemo(() => {
    return [...matches].sort(
      (a, b) => new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime()
    );
  }, [matches]);

  // Get unique tables from all matches
  const tables = useMemo(() => {
    const tableMap = new Map<string, TableType>();
    sortedMatches.forEach(match => {
      match.participants.forEach(p => {
        if (!tableMap.has(p.table.id)) {
          tableMap.set(p.table.id, p.table);
        }
      });
    });
    return Array.from(tableMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [sortedMatches]);

  const paired = tables.some(table => table.pairKey);
  const tableGroups = useMemo(() => groupTablesByPair(tables), [tables]);
  const orderedTables = useMemo(
    () => (paired ? tableGroups.flatMap(group => group.tables) : tables),
    [paired, tableGroups, tables]
  );

  const headerCellSx = {
    fontWeight: 600,
    fontSize: '1.25rem',
    py: 2,
    color: 'common.white'
  };

  return (
    <TableContainer
      component={Paper}
      elevation={0}
      sx={{ borderRadius: 0, backgroundColor: 'transparent' }}
    >
      <Table sx={{ borderCollapse: 'collapse' }}>
        <TableHead sx={{ backgroundColor: 'primary.main' }}>
          {paired && (
            <TableRow>
              <TableCell rowSpan={2} sx={headerCellSx}>
                {t('table.match')}
              </TableCell>
              <TableCell rowSpan={2} sx={{ ...headerCellSx, textAlign: 'center' }}>
                {t('table.scheduled-time')}
              </TableCell>
              {tableGroups.map(group => (
                <TableCell
                  key={group.key}
                  colSpan={group.tables.length}
                  align="center"
                  sx={headerCellSx}
                >
                  {group.name}
                </TableCell>
              ))}
            </TableRow>
          )}
          <TableRow>
            {!paired && (
              <>
                <TableCell
                  sx={{ fontWeight: 600, fontSize: '1.25rem', py: 2, color: 'common.white' }}
                >
                  {t('table.match')}
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 600,
                    fontSize: '1.25rem',
                    py: 2,
                    textAlign: 'center',
                    color: 'common.white'
                  }}
                >
                  {t('table.scheduled-time')}
                </TableCell>
              </>
            )}
            {orderedTables.map(table => (
              <TableCell
                key={table.id}
                align="center"
                sx={{ fontWeight: 600, fontSize: '1.25rem', py: 2, color: 'common.white' }}
              >
                {table.name}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedMatches.map(match => (
            <MatchRow
              key={match.id}
              match={match}
              tables={orderedTables}
              scoresheets={scoresheets}
              isActive={match.id === currentMatch?.id}
              isLoaded={match.id === data.loadedMatch}
              findScoresheetForTeam={findScoresheetForTeam}
              searchQuery={filterOptions.searchQuery}
            />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
