'use client';

import React from 'react';
import { Dayjs } from 'dayjs';
import { Box, Typography, IconButton } from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';
import { useTranslations } from 'next-intl';
import { AgendaBlockVisibility } from '../calendar-types';

interface BlockContentProps {
  title: string;
  startTime: Dayjs;
  durationSeconds: number;
  visibility: AgendaBlockVisibility;
  onEditClick: (e: React.MouseEvent) => void;
  onDeleteClick: (e: React.MouseEvent) => void;
}

const formatTime = (time: Dayjs) => time.format('HH:mm');

export const BlockContent: React.FC<BlockContentProps> = ({
  title,
  startTime,
  durationSeconds,
  visibility = 'public',
  onEditClick,
  onDeleteClick
}) => {
  const t = useTranslations(`pages.events.schedule.calendar.agenda`);
  
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start'
      }}
    >
      <Box sx={{ flex: 1 }}>
        <Typography
          variant="body2"
          sx={{
            color: 'white',
            fontWeight: 600,
            fontSize: '0.75rem',
            lineHeight: 1.2,
            cursor: 'pointer',
            '&:hover': {
              textDecoration: 'underline'
            }
          }}
          onClick={onEditClick}
          data-no-drag
        >
          {title || t('default-event-title')}
        </Typography>
        <Typography
          variant="caption"
          sx={{
            color: 'rgba(255,255,255,0.9)',
            fontSize: '0.625rem',
            lineHeight: 1
          }}
        >
          {`${formatTime(startTime)} - ${formatTime(startTime.clone().add(durationSeconds, 'second'))}`}
        </Typography>
        <Typography
          sx={{
            color: 'rgba(255,255,255,0.9)',
            fontSize: '0.625rem',
            lineHeight: 1
          }}
        >
          {t(visibility)}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 0.25 }} data-no-drag>
        <IconButton
          size="small"
          onClick={onEditClick}
          sx={{
            opacity: 0,
            transition: 'opacity 0.2s ease',
            color: 'white',
            p: 0.25,
            '&:hover': {
              backgroundColor: 'rgba(255,255,255,0.2)'
            }
          }}
          className="edit-button"
        >
          <Edit fontSize="small" />
        </IconButton>
        <IconButton
          size="small"
          onClick={onDeleteClick}
          sx={{
            opacity: 0,
            transition: 'opacity 0.2s ease',
            color: 'white',
            p: 0.25,
            '&:hover': {
              backgroundColor: 'rgba(255,255,255,0.2)'
            }
          }}
          className="delete-button"
        >
          <Delete fontSize="small" />
        </IconButton>
      </Box>
    </Box>
  );
};
