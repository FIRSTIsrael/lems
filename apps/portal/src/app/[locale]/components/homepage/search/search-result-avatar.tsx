import { Avatar } from '@mui/material';
import { Event as EventIcon } from '@mui/icons-material';

interface SearchResultAvatarProps {
  resultType: 'team' | 'event';
  src?: string | null;
}

export const SearchResultAvatar = ({ resultType, src }: SearchResultAvatarProps) => {
  if (resultType === 'team') {
    return (
      <Avatar
        src={src || '/assets/default-avatar.svg'}
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
