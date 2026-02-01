'use client';

import { useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import dayjs from 'dayjs';
import { TableCell, TableRow, Typography, Tooltip, Stack } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import type { Match, Scoresheet, Table as TableType } from '../../graphql/types';
import { ScoresheetStatusButton } from '../scoresheet-status-button';

interface MatchRowProps {
  match: Match;
  tables: TableType[];
  scoresheets: Scoresheet[];
  isActive: boolean;
  isLoaded: boolean;
  findScoresheetForTeam: (teamId: string, stage: string, round: number) => Scoresheet | undefined;
  searchQuery: string;
}

export function MatchRow({
  match,
  tables,
  scoresheets,
  isActive,
  isLoaded,
  findScoresheetForTeam,
  searchQuery
}: MatchRowProps) {
  const t = useTranslations('pages.head-referee');
  const rowRef = useRef<HTMLTableRowElement>(null);

  // Check if a team matches the search query
  const doesTeamMatchSearch = (teamNumber: string, teamName: string): boolean => {
    if (!searchQuery.trim()) return true;
    const escapedQuery = searchQuery.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escapedQuery, 'i');
    return regex.test(teamNumber) || regex.test(teamName);
  };

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
        <Typography variant="body1" fontWeight={600} sx={{ fontSize: '1.25rem' }}>
          #{match.number}
        </Typography>
      </TableCell>
      <TableCell sx={{ textAlign: 'center' }}>
        <Typography
          fontFamily="monospace"
          fontWeight={500}
          variant="body1"
          sx={{ fontSize: '1.25rem' }}
        >
          {scheduledTime}
        </Typography>
      </TableCell>
      {tables.map(table => {
        const participant = match.participants.find(p => p.table.id === table.id);
        if (!participant || !participant.team) {
          return (
            <TableCell key={table.id} align="center">
              <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.25rem' }}>
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
        const isPresent = participant.present;
        const isNoShow = isLoaded && !isPresent && isReady;

        // Show icons only for the loaded match
        const showIcon = isLoaded;

        // Check if team matches search filter
        const isTeamFiltered = doesTeamMatchSearch(participant.team.number, participant.team.name);

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
                isNoShow
                  ? t('table.participant-no-show')
                  : isLoaded && isReady
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
                  (isNoShow ? (
                    <CancelIcon
                      sx={{
                        color: 'warning.main',
                        fontSize: '1.25rem',
                        opacity: isTeamFiltered ? 1 : 0.35,
                        filter: isTeamFiltered ? 'none' : 'grayscale(0.7)'
                      }}
                    />
                  ) : isReady ? (
                    <CheckCircleIcon
                      sx={{
                        color: 'success.main',
                        fontSize: '1.25rem',
                        opacity: isTeamFiltered ? 1 : 0.35,
                        filter: isTeamFiltered ? 'none' : 'grayscale(0.7)'
                      }}
                    />
                  ) : (
                    <CancelIcon
                      sx={{
                        color: 'error.main',
                        fontSize: '1.25rem',
                        opacity: isTeamFiltered ? 1 : 0.35,
                        filter: isTeamFiltered ? 'none' : 'grayscale(0.7)'
                      }}
                    />
                  ))}
                <Stack
                  sx={{
                    alignItems: 'center',
                    minWidth: 0,
                    flex: 1,
                    opacity: isTeamFiltered ? 1 : 0.35,
                    filter: isTeamFiltered ? 'none' : 'grayscale(0.7)'
                  }}
                >
                  <Typography variant="body2" fontWeight={700} noWrap sx={{ fontSize: '1.25rem' }}>
                    #{participant.team.number}
                  </Typography>
                  <Typography
                    variant="caption"
                    color={isNoShow ? 'warning.main' : 'text.secondary'}
                    noWrap
                    sx={{ fontSize: '1rem', fontWeight: isNoShow ? 600 : 400 }}
                  >
                    {isNoShow ? t('table.participant-no-show') : participant.team.name}
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
