'use client';

import dayjs from 'dayjs';
import { useTranslations } from 'next-intl';
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
import { EventSummary } from '@lems/types/api/admin';

interface EventCardProps extends EventSummary {
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onCopy?: (id: string) => void;
}

export const EventCard: React.FC<EventCardProps> = ({
  id,
  name,
  location,
  startDate: date,
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
        <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
          {name}
        </Typography>

        <Stack spacing={1.5} sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LocationOn color="action" fontSize="small" />
            <Typography variant="body2" color="text.secondary">
              {location}
            </Typography>
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

      <CardActions sx={{ justifyContent: 'flex-end', pt: 1 }}>
        <Tooltip title={t('edit')}>
          <IconButton onClick={handleEdit} size="small" disabled>
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
    </Card>
  );
};
