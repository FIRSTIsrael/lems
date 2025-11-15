import { Paper, Avatar, Typography, SxProps, Theme } from '@mui/material';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { ReactNode } from 'react';

interface EditEventCardProps {
  icon: ReactNode;
  title: string;
  href: string;
  sx?: SxProps<Theme>;
}

const EditEventCard: React.FC<EditEventCardProps> = ({ icon, title, href, sx }) => {
  const t = useTranslations('pages.events.edit.cards');

  return (
    <Link href={href} style={{ textDecoration: 'none' }}>
      <Paper
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: 3,
          minHeight: 120,
          cursor: href ? 'pointer' : 'default',
          transition: 'all 0.2s ease-in-out',
          '&:hover': href
            ? {
                transform: 'translateY(-2px)',
                boxShadow: 3
              }
            : {},
          ...sx
        }}
      >
        <Avatar
          sx={{
            bgcolor: 'primary.main',
            color: 'white',
            width: 48,
            height: 48,
            mb: 2
          }}
        >
          {icon}
        </Avatar>
        <Typography variant="h6" textAlign="center" fontWeight={500}>
          {t(title)}
        </Typography>
      </Paper>
    </Link>
  );
};

export default EditEventCard;
