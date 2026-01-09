import { Box, Avatar, Stack, Typography } from '@mui/material';
import { Flag } from '@lems/shared';

interface Team {
  name: string;
  number: string | number;
  affiliation: string;
  city: string;
  region: string;
  logoUrl?: string | null;
  arrived: boolean;
}

interface TeamInfoProps {
  team: Team;
  size: 'sm' | 'md' | 'lg';
  textAlign?: 'left' | 'center' | 'right';
}

export const TeamInfo: React.FC<TeamInfoProps> = ({ team, size, textAlign = 'left' }) => {
  const avatarSizeMap = { sm: 40, md: 56, lg: 72 };
  const primaryTypographyVariantMap = { sm: 'body2', md: 'h6', lg: 'h5' };
  const secondaryTypographyVariantMap = { sm: 'caption', md: 'body2', lg: 'h6' };
  const flagSizeMap = { sm: 12, md: 16, lg: 24 };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
      <Avatar
        src={team.logoUrl ?? '/assets/default-avatar.svg'}
        sx={{
          width: avatarSizeMap[size],
          height: avatarSizeMap[size],
          color: 'white',
          objectFit: 'cover'
        }}
      />
      <Stack spacing={0.25} sx={{ flex: 1, minWidth: 0, textAlign }}>
        <Typography
          variant={primaryTypographyVariantMap[size] as 'body2' | 'h6' | 'h5'}
          sx={{ fontWeight: 700 }}
        >
          {team.name} #{team.number}
        </Typography>
        <Typography
          variant={secondaryTypographyVariantMap[size] as 'caption' | 'body2' | 'h6'}
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
                <Flag region={team.region} size={flagSizeMap[size]} />
              </Box>
            </>
          )}
          {team.affiliation && ` ${team.affiliation},`} {team.city}
        </Typography>
      </Stack>
    </Box>
  );
};
