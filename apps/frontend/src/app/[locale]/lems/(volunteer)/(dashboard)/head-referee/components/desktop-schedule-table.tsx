'use client';

import { useMemo, useEffect, useRef } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Tooltip,
  Stack
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import { Locale, Locales } from '@lems/localization';
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
              isLoaded={match.id === data.loadedMatch}
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
  isLoaded: boolean;
  findScoresheetForTeam: (teamId: string, stage: string, round: number) => Scoresheet | undefined;
}

function MatchRow({
  match,
  tables,
  scoresheets,
  isActive,
  isLoaded,
  findScoresheetForTeam
}: MatchRowProps) {
  const t = useTranslations('pages.head-referee');
  const rowRef = useRef<HTMLTableRowElement>(null);
  const currentLocale = useLocale() as Locale;
  const isRTL = Locales[currentLocale].rtl;

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
        backgroundColor: isActive ? 'primary.light' : 'background.paper',
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
        const isMatchCompleted = match.status === 'completed';

        // If match is completed and scoresheet exists, show the scoresheet button
        if (isMatchCompleted && scoresheet) {
          const isFiltered = scoresheets.some(s => s.id === scoresheet.id);

          return (
            <TableCell key={table.id} align="center">
              <ScoresheetStatusButton
                teamNumber={participant.team.number}
                teamSlug={participant.team.slug}
                teamName={participant.team.name}
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
        }

        // Show participant readiness state for non-completed matches
        const isReady = participant.ready;

        // Show icons only for the loaded match
        const showIcon = isLoaded;

        return (
          <TableCell
            key={table.id}
            align="center"
            sx={{
              cursor: 'default'
            }}
          >
            <Tooltip
              title={
                isLoaded && isReady
                  ? t('table.participant-ready')
                  : isLoaded && !isReady
                    ? t('table.participant-not-ready')
                    : ''
              }
            >
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="center"
                spacing={0.5}
                sx={{ width: '100%' }}
              >
                {!isRTL &&
                  showIcon &&
                  (isReady ? (
                    <CheckCircleIcon sx={{ color: 'success.main', fontSize: '1.25rem' }} />
                  ) : (
                    <CancelIcon sx={{ color: 'error.main', fontSize: '1.25rem' }} />
                  ))}
                <Stack
                  sx={{
                    alignItems: 'center',
                    minWidth: 0,
                    flex: 1
                  }}
                >
                  <Typography variant="body2" fontWeight={600} noWrap>
                    #{participant.team.number}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" noWrap>
                    {participant.team.name}
                  </Typography>
                </Stack>
                {isRTL &&
                  showIcon &&
                  (isReady ? (
                    <CheckCircleIcon sx={{ color: 'success.main', fontSize: '1.25rem' }} />
                  ) : (
                    <CancelIcon sx={{ color: 'error.main', fontSize: '1.25rem' }} />
                  ))}
              </Stack>
            </Tooltip>
          </TableCell>
        );
      })}
    </TableRow>
  );
}
