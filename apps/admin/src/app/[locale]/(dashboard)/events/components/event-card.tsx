'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Box,
  Chip,
  IconButton,
  Stack,
  Alert,
  Tooltip
} from '@mui/material';
import {
  LocationOn,
  CalendarMonth,
  Group,
  Edit,
  Delete,
  ContentCopy,
  CheckCircle,
  Warning
} from '@mui/icons-material';
import { useTranslations } from 'next-intl';

interface Division {
  id: string;
  name: string;
  color?: string;
}

interface EventCardProps {
  id: string;
  name: string;
  location: string;
  date: string;
  teamCount: number;
  divisions: Division[];
  isFullySetUp: boolean;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onCopy?: (id: string) => void;
}

export const EventCard: React.FC<EventCardProps> = ({
  id,
  name,
  location,
  date,
  teamCount,
  divisions,
  isFullySetUp,
  onEdit,
  onDelete,
  onCopy
}) => {
  const t = useTranslations('pages.events.card');

  const handleEdit = () => onEdit?.(id);
  const handleDelete = () => onDelete?.(id);
  const handleCopy = () => onCopy?.(id);

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        '&:hover': {
          boxShadow: 4
        }
      }}
    >
      <CardContent sx={{ flexGrow: 1, pb: 1 }}>
        {/* Event Name */}
        <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
          {name}
        </Typography>

        {/* Event Details */}
        <Stack spacing={1.5} sx={{ mb: 2 }}>
          {/* Location */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LocationOn color="action" fontSize="small" />
            <Typography variant="body2" color="text.secondary">
              {location}
            </Typography>
          </Box>

          {/* Date */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CalendarMonth color="action" fontSize="small" />
            <Typography variant="body2" color="text.secondary">
              {date}
            </Typography>
          </Box>

          {/* Team Count */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Group color="action" fontSize="small" />
            <Typography variant="body2" color="text.secondary">
              {teamCount} {t('teams')}
            </Typography>
          </Box>
        </Stack>

        {/* Divisions */}
        {divisions.length > 1 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
              {t('divisions')}:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {divisions.slice(0, 3).map(division => (
                <Chip
                  key={division.id}
                  label={division.name}
                  size="small"
                  variant="outlined"
                  sx={{
                    backgroundColor: division.color ? `${division.color}20` : undefined,
                    borderColor: division.color || undefined
                  }}
                />
              ))}
              {divisions.length > 3 && (
                <Chip
                  label={t('more-divisions', { count: divisions.length - 3 })}
                  size="small"
                  variant="outlined"
                  color="default"
                />
              )}
            </Box>
          </Box>
        )}

        {/* Status */}
        <Box sx={{ mt: 'auto' }}>
          {isFullySetUp ? (
            <Alert severity="success" icon={<CheckCircle />} sx={{ py: 0.5 }}>
              {t('fully-set-up')}
            </Alert>
          ) : (
            <Alert severity="warning" icon={<Warning />} sx={{ py: 0.5 }}>
              {t('missing-details')}
            </Alert>
          )}
        </Box>
      </CardContent>

      {/* Action Buttons */}
      <CardActions sx={{ justifyContent: 'flex-end', pt: 1 }}>
        <Tooltip title={t('edit')}>
          <IconButton onClick={handleEdit} size="small">
            <Edit />
          </IconButton>
        </Tooltip>
        <Tooltip title={t('delete')}>
          <IconButton onClick={handleDelete} size="small">
            <Delete />
          </IconButton>
        </Tooltip>
        <Tooltip title={t('copy')}>
          <IconButton onClick={handleCopy} size="small">
            <ContentCopy />
          </IconButton>
        </Tooltip>
      </CardActions>
    </Card>
  );
};
