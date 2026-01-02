'use client';

import { useState } from 'react';
import dayjs from 'dayjs';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import useSWR from 'swr';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Box,
  Chip,
  IconButton,
  Stack,
  Tooltip
} from '@mui/material';
import { LocationOn, CalendarMonth, Group, Edit, Delete, ContentCopy } from '@mui/icons-material';
import { EventSummary, Division } from '@lems/types/api/admin';
import { Flag } from '@lems/shared';
import { useSession } from '../../components/session-context';
import { EventMissingInfo } from './missing-info/event-missing-info';

interface EventCardProps extends EventSummary {
  onDelete?: (id: string) => void;
  onCopy?: (id: string) => void;
}

export const EventCard: React.FC<EventCardProps> = ({
  id,
  name,
  slug,
  location,
  region,
  startDate: date,
  teamCount,
  divisions,
  isFullySetUp,
  adminIds,
  onDelete,
  onCopy
}) => {
  const { user } = useSession();
  const router = useRouter();
  const t = useTranslations('pages.events.card');
  const [showDetails, setShowDetails] = useState(false);

  const isAssigned = adminIds.includes(user.id);

  const { data: detailedDivisions } = useSWR<Division[]>(
    !isFullySetUp ? `/admin/events/${id}/divisions` : null
  );

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
        <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
          {name}
        </Typography>

        <Stack spacing={1.5} sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LocationOn color="action" fontSize="small" />
            <Typography variant="body2" color="text.secondary">
              {location}
            </Typography>
            <Flag region={region} size={18} />
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CalendarMonth color="action" fontSize="small" />
            <Typography variant="body2" color="text.secondary">
              {dayjs(date).format('DD/MM/YYYY')}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Group color="action" fontSize="small" />
            <Typography variant="body2" color="text.secondary">
              {teamCount} {t('teams')}
            </Typography>
          </Box>
        </Stack>

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

        <Box sx={{ mt: 'auto' }}>
          <EventMissingInfo
            divisions={detailedDivisions || divisions}
            isFullySetUp={isFullySetUp}
            onShowDetails={() => setShowDetails(true)}
          />
        </Box>
      </CardContent>

      {isAssigned && (
        <CardActions sx={{ justifyContent: 'flex-end', pt: 1 }}>
          <Tooltip title={t('edit')}>
            <IconButton
              onClick={() => {
                router.push(`/events/${slug}/edit`);
              }}
              size="small"
            >
              <Edit />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('delete')}>
            <IconButton onClick={handleDelete} size="small" disabled>
              <Delete />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('copy')}>
            <IconButton onClick={handleCopy} size="small" disabled>
              <ContentCopy />
            </IconButton>
          </Tooltip>
        </CardActions>
      )}
    </Card>
  );
};
