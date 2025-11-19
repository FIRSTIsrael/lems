'use client';

import { Chip, Stack, Typography, Avatar, Box, Tooltip } from '@mui/material';
import { Flag } from '@lems/shared';
import WarningIcon from '@mui/icons-material/Warning';
import { useTranslations } from 'next-intl';
import type { Team } from '../judge.graphql';

interface TeamInfoCellProps {
  team: Team;
}

export const TeamInfoCell: React.FC<TeamInfoCellProps> = ({ team }) => {
  const t = useTranslations('pages.judge.schedule');

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <Stack spacing={1} sx={{ minWidth: 200 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Tooltip title={`Team #${team.number}`}>
          <Avatar
            src={team.logoUrl ?? '/assets/default-avatar.svg'}
            sx={{
              width: 40,
              height: 40,
              fontSize: '0.95rem',
              fontWeight: 700,
              bgcolor: 'primary.main',
              color: 'white',
              objectFit: 'cover'
            }}
          >
            {getInitials(team.name) || team.number.charAt(0)}
          </Avatar>
        </Tooltip>
        <Stack spacing={0.25} sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
            {team.name} #{team.number}
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {team.affiliation && ` ${team.affiliation}`}
            {team.region && (
              <>
                <Box
                  component="span"
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.5
                  }}
                >
                  <Flag region={team.region} size={14} />
                </Box>
              </>
            )}
          </Typography>
        </Stack>
      </Box>
      {!team.arrived && (
        <Chip
          icon={<WarningIcon />}
          label={t('arrival.not-arrived')}
          color="warning"
          variant="outlined"
          size="small"
          sx={{ width: 'fit-content', fontWeight: 600 }}
        />
      )}
      {team.location && (
        <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
          Location: {team.location}
        </Typography>
      )}
    </Stack>
  );
};
