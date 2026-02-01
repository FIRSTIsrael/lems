'use client';

import { useMemo, useEffect, useRef } from 'react';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import { useTranslations } from 'next-intl';
import { Card, CardContent, Stack, Typography, Box, Divider, Chip, Tooltip } from '@mui/material';
import { Cancel, CheckCircleSharp } from '@mui/icons-material';
import type { Match, Scoresheet } from '../graphql/types';
import { useTime } from '../../../../../../../lib/time/hooks';
import { useHeadRefereeData } from './head-referee-context';
import { ScoresheetStatusButton } from './scoresheet-status-button';

dayjs.extend(isBetween);

interface MobileScheduleCardsProps {
  matches: Match[];
  scoresheets: Scoresheet[];
}

export function MobileScheduleCards({ matches, scoresheets }: MobileScheduleCardsProps) {
  const { data, findScoresheetForTeam, filterOptions } = useHeadRefereeData();
  const currentTime = useTime({ interval: 1000 });

  // Sort matches by scheduled time
  const sortedMatches = useMemo(() => {
    return [...matches].sort(
      (a, b) => new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime()
    );
  }, [matches]);

  // Find active match
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
    <Stack spacing={2}>
      {sortedMatches.map(match => (
        <MatchCard
          key={match.id}
          match={match}
          scoresheets={scoresheets}
          isActive={match.id === activeMatchId}
          isLoaded={match.id === data.loadedMatch}
          findScoresheetForTeam={findScoresheetForTeam}
          searchQuery={filterOptions.searchQuery}
        />
      ))}
    </Stack>
  );
}

interface MatchCardProps {
  match: Match;
  scoresheets: Scoresheet[];
  isActive: boolean;
  isLoaded: boolean;
  findScoresheetForTeam: (teamId: string, stage: string, round: number) => Scoresheet | undefined;
  searchQuery: string;
}

function MatchCard({
  match,
  scoresheets,
  isActive,
  isLoaded,
  findScoresheetForTeam,
  searchQuery
}: MatchCardProps) {
  const t = useTranslations('pages.head-referee');
  const cardRef = useRef<HTMLDivElement>(null);

  // Check if a team matches the search query
  const doesTeamMatchSearch = (teamNumber: string, teamName: string): boolean => {
    if (!searchQuery.trim()) return true;
    const escapedQuery = searchQuery.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escapedQuery, 'i');
    return regex.test(teamNumber) || regex.test(teamName);
  };

  // Auto-scroll to active match
  useEffect(() => {
    if (isActive && cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [isActive]);

  const scheduledTime = dayjs(match.scheduledTime).format('HH:mm');

  return (
    <Card
      ref={cardRef}
      elevation={isActive ? 4 : 2}
      sx={{
        backgroundColor: 'background.paper',
        borderRadius: 2,
        transition: 'elevation 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        overflow: 'visible'
      }}
    >
      <CardContent sx={{ pb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography
            variant="h6"
            fontWeight={600}
            color="text.primary"
            sx={{ fontSize: '1.5rem' }}
          >
            #{match.number}
          </Typography>
          <Chip
            label={scheduledTime}
            size="medium"
            variant="outlined"
            sx={{ fontFamily: 'monospace', fontWeight: 500, fontSize: '1.1rem' }}
          />
        </Box>

        <Divider sx={{ mb: 2 }} />

        <Stack spacing={1.5}>
          {match.participants
            .filter(p => p.team)
            .map(participant => {
              const scoresheet = findScoresheetForTeam(
                participant.team!.id,
                match.stage,
                match.round
              );

              const isFiltered = scoresheet ? scoresheets.some(s => s.id === scoresheet.id) : false;
              const isTeamFiltered = doesTeamMatchSearch(
                participant.team!.number,
                participant.team!.name
              );

              if (match.status === 'completed' && scoresheet) {
                return (
                  <Box
                    key={participant.id}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      p: 1.5,
                      backgroundColor: 'background.default',
                      borderRadius: 1.5,
                      border: '1px solid',
                      borderColor: 'divider',
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                      opacity: isTeamFiltered ? 1 : 0.35,
                      filter: isTeamFiltered ? 'none' : 'grayscale(0.7)',
                      '&:hover': {
                        backgroundColor: 'action.hover',
                        borderColor: 'action.hover'
                      }
                    }}
                  >
                    <Box>
                      <Typography
                        variant="body2"
                        fontWeight={700}
                        color="text.primary"
                        sx={{ fontSize: '1.25rem' }}
                      >
                        {participant.table.name}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ fontSize: '1rem' }}
                      >
                        {participant.team!.name}
                      </Typography>
                    </Box>

                    {match.status === 'completed' && scoresheet && (
                      <ScoresheetStatusButton
                        teamNumber={participant.team!.number}
                        teamSlug={participant.team!.slug}
                        teamName={participant.team!.name}
                        scoresheetSlug={scoresheet.slug}
                        status={scoresheet.status}
                        escalated={scoresheet.escalated}
                        score={scoresheet.data?.score}
                        gp={scoresheet.data?.gp?.value}
                        disabled={!participant.team!.arrived || match.status !== 'completed'}
                        dimmed={!isFiltered}
                      />
                    )}
                  </Box>
                );
              }

              // Show participant readiness state for non-completed matches
              const isReady = participant.ready;
              const isPresent = participant.present;
              const isNoShow = isLoaded && !isPresent && isReady;

              // Show icons only for the loaded match
              const showIcon = isLoaded;

              return (
                <Tooltip
                  key={participant.id}
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
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      p: 1.5,
                      backgroundColor: 'background.default',
                      borderRadius: 1.5,
                      border: '1px solid',
                      borderColor: isNoShow ? 'warning.main' : 'divider',
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                      opacity: isTeamFiltered ? 1 : 0.35,
                      filter: isTeamFiltered ? 'none' : 'grayscale(0.7)',
                      '&:hover': {
                        backgroundColor: 'action.hover',
                        borderColor: isNoShow ? 'warning.main' : 'action.hover'
                      }
                    }}
                  >
                    <Box>
                      <Typography
                        variant="body2"
                        fontWeight={700}
                        color="text.primary"
                        sx={{ fontSize: '1.25rem' }}
                      >
                        {participant.table.name}
                      </Typography>
                      <Typography
                        variant="caption"
                        color={isNoShow ? 'warning.main' : 'text.secondary'}
                        sx={{ fontSize: '1rem', fontWeight: isNoShow ? 600 : 400 }}
                      >
                        {isNoShow ? t('table.participant-no-show') : participant.team!.name}
                      </Typography>
                    </Box>
                    {showIcon &&
                      (isNoShow ? (
                        <Cancel
                          sx={{
                            color: 'warning.main',
                            fontSize: '1.5rem'
                          }}
                        />
                      ) : isReady ? (
                        <CheckCircleSharp
                          color="success"
                          sx={{
                            fontSize: '1.5rem'
                          }}
                        />
                      ) : (
                        <Cancel
                          color="error"
                          sx={{
                            fontSize: '1.5rem'
                          }}
                        />
                      ))}
                  </Box>
                </Tooltip>
              );
            })}
        </Stack>
      </CardContent>
    </Card>
  );
}
