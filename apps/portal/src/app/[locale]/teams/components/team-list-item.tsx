import {
  Avatar,
  Box,
  Card,
  Grid,
  Link,
  ListItem,
  ListItemAvatar,
  ListItemText
} from '@mui/material';
import { Team } from '@lems/types/api/portal';
import { DirectionalIcon } from '@lems/localization';
import { Flag } from '@lems/shared';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import NextLink from 'next/link';

export const TeamListItem: React.FC<{ team: Team }> = ({ team }) => {
  return (
    <Grid component={Card} variant="outlined" size={{ xs: 12, sm: 6, md: 4 }} height="100%">
      <Link
        component={NextLink}
        href={`/teams/${team.slug}`}
        sx={{
          textDecoration: 'none',
          '&:hover': { textDecoration: 'underline' }
        }}
      >
        <ListItem>
          <ListItemAvatar>
            <Avatar src={team.logoUrl ?? '/assets/default-avatar.svg'} />
          </ListItemAvatar>
          <ListItemText
            primary={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {team.name} | #{team.number}
                <Flag region={team.region} size={16} />
              </Box>
            }
            secondary={team.affiliation}
          />
          <DirectionalIcon ltr={ChevronRight} rtl={ChevronLeft} />
        </ListItem>
      </Link>
    </Grid>
  );
};
