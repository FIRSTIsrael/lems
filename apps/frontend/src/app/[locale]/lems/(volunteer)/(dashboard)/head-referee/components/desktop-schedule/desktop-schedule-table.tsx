'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
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

  return (
    <TableContainer
      component={Paper}
      elevation={0}
      sx={{ borderRadius: 0, backgroundColor: 'transparent' }}
    >
      <Table sx={{ borderCollapse: 'collapse' }}>
        <TableHead sx={{ backgroundColor: 'primary.main' }}>
          <TableRow>
            <TableCell sx={{ fontWeight: 600, fontSize: '1.25rem', py: 2, color: 'common.white' }}>
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
            {tables.map(table => (
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
              tables={tables}
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
