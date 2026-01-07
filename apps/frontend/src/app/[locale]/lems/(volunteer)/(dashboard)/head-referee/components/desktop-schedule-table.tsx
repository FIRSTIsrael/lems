'use client';

import { useMemo, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography
} from '@mui/material';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import type { Match, Scoresheet, Table as TableType } from '../graphql/types';
import { useTime } from '../../../../../../../lib/time/hooks';
import { useHeadRefereeData } from './head-referee-context';
import { ScoresheetStatusButton } from './scoresheet-status-button';

dayjs.extend(isBetween);

interface DesktopScheduleTableProps {
  matches: Match[];
  scoresheets: Scoresheet[];
}

export function DesktopScheduleTable({ matches, scoresheets }: DesktopScheduleTableProps) {
  const t = useTranslations('pages.head-referee');
  const { data, findScoresheetForTeam } = useHeadRefereeData();
  const currentTime = useTime({ interval: 1000 });

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

  // Find active match (in progress and within match time)
  const activeMatchId = useMemo(() => {
    return sortedMatches.find(match => {
      if (match.status !== 'in-progress') return false;
      if (!match.startTime) return false;

      const startTime = dayjs(match.startTime);
      const endTime = startTime.add(data.matchLength || 150, 'second');
      return currentTime.isBetween(startTime, endTime);
    })?.id;
  }, [sortedMatches, currentTime, data.matchLength]);

  return (
    <TableContainer
      component={Paper}
      elevation={0}
      sx={{ borderRadius: 0, backgroundColor: 'transparent' }}
    >
      <Table sx={{ borderCollapse: 'collapse' }}>
        <TableHead sx={{ backgroundColor: 'primary.main' }}>
          <TableRow>
            <TableCell sx={{ fontWeight: 600, fontSize: '1rem', py: 2, color: 'common.white' }}>
              {t('table.match')}
            </TableCell>
            <TableCell
              sx={{
                fontWeight: 600,
                fontSize: '1rem',
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
                sx={{ fontWeight: 600, fontSize: '1rem', py: 2, color: 'common.white' }}
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
              isActive={match.id === activeMatchId}
              findScoresheetForTeam={findScoresheetForTeam}
            />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

interface MatchRowProps {
  match: Match;
  tables: TableType[];
  scoresheets: Scoresheet[];
  isActive: boolean;
  findScoresheetForTeam: (teamId: string, stage: string, round: number) => Scoresheet | undefined;
}

function MatchRow({ match, tables, scoresheets, isActive, findScoresheetForTeam }: MatchRowProps) {
  const rowRef = useRef<HTMLTableRowElement>(null);

  // Auto-scroll to active match on mount
  useEffect(() => {
    if (isActive && rowRef.current) {
      rowRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [isActive]);

  const scheduledTime = dayjs(match.scheduledTime).format('HH:mm');

  return (
    <TableRow
      ref={rowRef}
      hover
      sx={{
        backgroundColor: isActive ? 'action.selected' : 'background.paper',
        '&:last-child td': { border: 0 },
        '& td': { py: 2 }
      }}
    >
      <TableCell>
        <Typography variant="body1" fontWeight={600}>
          #{match.number}
        </Typography>
      </TableCell>
      <TableCell sx={{ textAlign: 'center' }}>
        <Typography fontFamily="monospace" fontWeight={500} variant="body1">
          {scheduledTime}
        </Typography>
      </TableCell>
      {tables.map(table => {
        const participant = match.participants.find(p => p.table.id === table.id);
        if (!participant || !participant.team) {
          return (
            <TableCell key={table.id} align="center">
              <Typography variant="body1" color="text.secondary">
                -
              </Typography>
            </TableCell>
          );
        }

        const scoresheet = findScoresheetForTeam(participant.team.id, match.stage, match.round);

        if (!scoresheet) {
          return (
            <TableCell key={table.id} align="center">
              <Typography variant="body1" color="text.secondary">
                -
              </Typography>
            </TableCell>
          );
        }

        const isFiltered = scoresheets.some(s => s.id === scoresheet.id);

        return (
          <TableCell key={table.id} align="center">
            <ScoresheetStatusButton
              teamNumber={participant.team.number}
              teamSlug={participant.team.slug}
              scoresheetSlug={scoresheet.slug}
              status={scoresheet.status}
              escalated={scoresheet.escalated}
              score={scoresheet.data?.score}
              gp={scoresheet.data?.gp?.value}
              disabled={!participant.team.arrived}
              dimmed={!isFiltered}
            />
          </TableCell>
        );
      })}
    </TableRow>
  );
}
