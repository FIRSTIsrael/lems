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
  getStage: (stage: string) => string;
  matches: TournamentManagerData['division']['field']['matches'];
  sessions: TournamentManagerData['division']['judging']['sessions'];
}

export function SecondSlotInfo({
  slot: secondSlot,
  division,
  isMobile,
  getStage,
  matches,
  sessions
}: SecondSlotInfoProps) {
  const t = useTranslations('pages.tournament-manager');

  if (!secondSlot) return null;

  return (
    <>
      <Divider />
      <Box>
        <Typography variant="subtitle2" fontWeight={600} gutterBottom>
          {t('second-team-selected')}
        </Typography>
        <Paper sx={{ p: 1.5, bgcolor: 'rgba(25, 118, 210, 0.3)' }}>
          {secondSlot.team ? (
            <>
              <Typography variant="body1" fontWeight={700} noWrap>
                #{secondSlot.team.number} {secondSlot.team.name}
              </Typography>
              {(secondSlot?.team?.affiliation || secondSlot?.team?.city) && (
                <Typography variant="body2" color="text.secondary" noWrap>
                  {[secondSlot.team.affiliation, secondSlot.team.city].filter(Boolean).join(' • ')}
                </Typography>
              )}
            </>
          ) : (
            <Typography variant="body1" color="text.secondary">
              {t('no-team')}
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
            getStage={getStage}
          />

          <JudgingSessionsList
            slot={secondSlot}
            division={division}
            sessions={sessions}
            isMobile={isMobile}
            getStage={getStage}
          />
        </>
      )}
    </>
  );
}
