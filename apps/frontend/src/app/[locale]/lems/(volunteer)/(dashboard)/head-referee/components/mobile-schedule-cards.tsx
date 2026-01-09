'use client';

import { useMemo, useEffect, useRef } from 'react';
import { Card, CardContent, Stack, Typography, Box, Divider, Chip } from '@mui/material';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
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
  const { data, findScoresheetForTeam } = useHeadRefereeData();
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
          findScoresheetForTeam={findScoresheetForTeam}
        />
      ))}
    </Stack>
  );
}

interface MatchCardProps {
  match: Match;
  scoresheets: Scoresheet[];
  isActive: boolean;
  findScoresheetForTeam: (teamId: string, stage: string, round: number) => Scoresheet | undefined;
}

function MatchCard({ match, scoresheets, isActive, findScoresheetForTeam }: MatchCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

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
          <Typography variant="h6" fontWeight={600} color="text.primary">
            #{match.number}
          </Typography>
          <Chip
            label={scheduledTime}
            size="small"
            variant="outlined"
            sx={{ fontFamily: 'monospace', fontWeight: 500 }}
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
                    '&:hover': {
                      backgroundColor: 'action.hover',
                      borderColor: 'action.hover'
                    }
                  }}
                >
                  <Box>
                    <Typography variant="body2" fontWeight={600} color="text.primary">
                      {participant.table.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {participant.team!.name}
                    </Typography>
                  </Box>

                  {scoresheet && (
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
            })}
        </Stack>
      </CardContent>
    </Card>
  );
}
