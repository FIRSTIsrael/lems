'use client';

import { useTranslations } from 'next-intl';
import { Box, Tooltip } from '@mui/material';
import { Match } from '../../graphql';
import { getStatusIcon, type TeamReadinessStatus } from './utils';

const getStatus = (participant: Match['participants'][number]): TeamReadinessStatus => {
  // Empty: No team assigned to participant
  if (!participant.team) return 'empty';

  // No-show: Team did not arrive at event
  if (!participant.team.arrived) return 'no-show';

  // Ready: Team is at table and marked ready
  if (participant.ready) return 'ready';

  // Present: Team arrived at table but not yet ready
  if (participant.present) return 'present';

  // Queued: Team called to match, on the way to table
  if (participant.queued) return 'queued';

  // Conflict: team is somewhere else (not present, not queued)
  // TODO: Implement conflict detection
  // eslint-disable-next-line no-constant-condition
  if (false) return 'conflict';

  // Missing: team didn't queue, we're still waiting
  return 'missing';
};

interface StatusBadgeProps {
  participant: Match['participants'][number];
}

export const TeamStatusBadge = ({ participant }: StatusBadgeProps) => {
  const t = useTranslations('pages.scorekeeper.next-match');
  const status = getStatus(participant);

  return (
    <Tooltip title={t(`statuses.${status}`)}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          minWidth: 28,
          width: 28,
          height: 28
        }}
      >
        {getStatusIcon(status)}
      </Box>
    </Tooltip>
  );
};
