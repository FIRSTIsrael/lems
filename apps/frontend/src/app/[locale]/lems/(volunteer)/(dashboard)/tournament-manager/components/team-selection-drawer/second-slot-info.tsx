'use client';

import { Box, Typography, Paper, Divider } from '@mui/material';
import { useTranslations } from 'next-intl';
import type { SlotInfo } from '../types';
import type { TournamentManagerData } from '../../graphql';
import { FieldMatchesList } from './field-matches-list';
import { JudgingSessionsList } from './judging-sessions-list';

interface SecondSlotInfoProps {
  slot: SlotInfo | null;
  division: TournamentManagerData['division'];
  isMobile: boolean;
  matches: TournamentManagerData['division']['field']['matches'];
  sessions: TournamentManagerData['division']['judging']['sessions'];
}

export function SecondSlotInfo({
  slot: secondSlot,
  division,
  isMobile,
  matches,
  sessions
}: SecondSlotInfoProps) {
  const t = useTranslations('pages.tournament-manager');

  if (!secondSlot) return null;

  return (
    <>
      <Divider />
      <Box>
        <Typography variant="subtitle2" gutterBottom sx={{
          fontWeight: 600
        }}>
          {t('slots.second-team-selected')}
        </Typography>
        <Paper sx={{ p: 1.5, bgcolor: 'rgba(25, 118, 210, 0.3)' }}>
          {secondSlot.team ? (
            <>
              <Typography variant="body1" noWrap sx={{
                fontWeight: 700
              }}>
                #{secondSlot.team.number} {secondSlot.team.name}
              </Typography>
              {(secondSlot?.team?.affiliation || secondSlot?.team?.city) && (
                <Typography variant="body2" noWrap sx={{
                  color: "text.secondary"
                }}>
                  {[secondSlot.team.affiliation, secondSlot.team.city].filter(Boolean).join(' • ')}
                </Typography>
              )}
            </>
          ) : (
            <Typography variant="body1" sx={{
              color: "text.secondary"
            }}>
              {t('labels.no-team')}
            </Typography>
          )}
        </Paper>
      </Box>
      {secondSlot.team && (
        <>
          <FieldMatchesList
            slot={secondSlot}
            division={division}
            matches={matches}
            isMobile={isMobile}
          />

          <JudgingSessionsList
            slot={secondSlot}
            division={division}
            sessions={sessions}
            isMobile={isMobile}
          />
        </>
      )}
    </>
  );
}
