'use client';

import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Box, Typography, IconButton, Stack } from '@mui/material';
import { ArrowBack, ArrowForward } from '@mui/icons-material';
import { DirectionalIcon } from '@lems/localization';
import { useEvent } from '../components/event-context';

interface EventPageTitleProps {
  title: string;
  children?: ReactNode;
}

export function EventPageTitle({ title, children }: EventPageTitleProps) {
  const router = useRouter();
  const event = useEvent();
  const t = useTranslations('pages.events.layout.event-page-title');

  const handleBackClick = () => {
    router.push(`/events/${event.slug}/edit`);
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Stack direction="row" alignItems="center" spacing={2}>
          <IconButton
            onClick={handleBackClick}
            sx={{
              color: 'primary.main',
              '&:hover': {
                backgroundColor: 'primary.50'
              }
            }}
            aria-label={t('back-to-event')}
          >
            <DirectionalIcon ltr={ArrowBack} rtl={ArrowForward} />
          </IconButton>
          <Typography variant="h1" component="h1">
            {title}
          </Typography>
        </Stack>
        {children && <Box>{children}</Box>}
      </Stack>
    </Box>
  );
}
