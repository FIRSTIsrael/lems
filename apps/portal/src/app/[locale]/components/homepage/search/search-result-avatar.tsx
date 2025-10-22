import { Avatar } from '@mui/material';
import { Event as EventIcon } from '@mui/icons-material';

interface SearchResultAvatarProps {
  resultType: 'team' | 'event';
  teamData?: {
    logoUrl?: string;
  };
}

export const SearchResultAvatar = ({ resultType, teamData }: SearchResultAvatarProps) => {
  if (resultType === 'team') {
    return (
      <Avatar
        src={teamData?.logoUrl || '/assets/default-avatar.svg'}
        sx={{
          width: 32,
          height: 32,
          objectFit: 'cover'
        }}
      />
    );
  }

  return (
    <Avatar
      sx={{
        src: '/assets/default-avatar.svg',
        width: 32,
        height: 32,
        objectFit: 'cover'
      }}
    >
      <EventIcon sx={{ fontSize: 18 }} />
    </Avatar>
  );
};
