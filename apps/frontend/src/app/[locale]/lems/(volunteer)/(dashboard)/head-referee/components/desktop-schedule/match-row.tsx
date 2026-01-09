'use client';

import { useEffect, useRef } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { TableCell, TableRow, Typography, Tooltip, Stack } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import dayjs from 'dayjs';
import { Locale, Locales } from '@lems/localization';
import type { Match, Scoresheet, Table as TableType } from '../../graphql/types';
import { ScoresheetStatusButton } from '../scoresheet-status-button';

interface MatchRowProps {
  match: Match;
  tables: TableType[];
  scoresheets: Scoresheet[];
  isActive: boolean;
  isLoaded: boolean;
  findScoresheetForTeam: (teamId: string, stage: string, round: number) => Scoresheet | undefined;
}

export function MatchRow({
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
                {showIcon &&
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
              </Stack>
            </Tooltip>
          </TableCell>
        );
      })}
    </TableRow>
  );
}
