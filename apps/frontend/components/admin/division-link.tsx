import { WithId } from 'mongodb';
import Link from 'next/link';
import { Avatar, Paper, Stack, Typography } from '@mui/material';
import HomeIcon from '@mui/icons-material/HomeRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import { Division } from '@lems/types';
import { getBackgroundColor } from '../../lib/utils/theme';

interface DivisionLinkProps {
  division: WithId<Division>;
}

const DivisionLink: React.FC<DivisionLinkProps> = ({ division }) => {
  return (
    <Link
      href={`/admin/event/${division.eventId}/division/${division._id}`}
      passHref
      legacyBehavior
    >
      <Stack
        component={Paper}
        p={2}
        mt={2}
        spacing={2}
        direction="row"
        alignItems="center"
        sx={{ cursor: 'pointer' }}
      >
        <Avatar
          sx={{
            color: division.color,
            backgroundColor: getBackgroundColor(division.color ?? 'gray', 'light')
          }}
        >
          <HomeIcon />
        </Avatar>
        <Typography fontWeight={600} fontSize="1.125rem">
          ניהול בית {division.name}
        </Typography>
        <OpenInNewRoundedIcon htmlColor="#666" fontSize="small" />
      </Stack>
    </Link>
  );
};

export default DivisionLink;
