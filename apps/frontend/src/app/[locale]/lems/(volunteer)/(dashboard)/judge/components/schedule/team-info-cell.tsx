'use client';

import { Chip, Stack, Typography, Avatar, Box } from '@mui/material';
import { Flag } from '@lems/shared';
import WarningIcon from '@mui/icons-material/Warning';
import { useTranslations } from 'next-intl';
import type { Team } from '../judge.graphql';

interface TeamInfoCellProps {
  team: Team;
}

export const TeamInfoCell: React.FC<TeamInfoCellProps> = ({ team }) => {
  const t = useTranslations('pages.judge.schedule');

  return (
    <Stack spacing={1} sx={{ minWidth: 200 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Avatar
          src={team.logoUrl ?? '/assets/default-avatar.svg'}
          sx={{
            width: 40,
            height: 40,
            fontSize: '0.95rem',
            fontWeight: 700,
            color: 'white',
            objectFit: 'cover'
          }}
        />
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
              textOverflow: 'ellipsis',
              display: 'flex',
              gap: 0.5
            }}
          >
            {team.region && (
              <>
                <Box
                  component="span"
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center'
                  }}
                >
                  <Flag region={team.region} size={14} />
                </Box>
              </>
            )}
            {team.affiliation && ` ${team.affiliation},`} {team.city}
          </Typography>
        </Stack>
      </Box>
      {!team.arrived && (
        <Chip
          icon={<WarningIcon />}
          label={t('not-arrived')}
          color="warning"
          variant="outlined"
          size="small"
          sx={{ width: 'fit-content', fontWeight: 600, p: 1 }}
        />
      )}
    </Stack>
  );
};
