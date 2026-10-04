'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import dayjs from 'dayjs';
import {
  Box,
  Typography,
  IconButton,
  Stack,
  Chip,
  Tooltip,
  Paper
} from '@mui/material';
import {
  LocationOn,
  CalendarMonth,
  Group,
  Edit,
  PushPin,
  PushPinOutlined,
  CheckCircle,
  Warning
} from '@mui/icons-material';
import { EventSummary } from '@lems/types/api/admin';
import { Flag } from '@lems/shared';
import { useSession } from '../../components/session-context';

interface EventListItemProps extends EventSummary {
  isPinned?: boolean;
  onTogglePin?: (id: string) => void;
}

export const EventListItem: React.FC<EventListItemProps> = ({
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
  isPinned = false,
  onTogglePin
}) => {
  const { user } = useSession();
  const router = useRouter();
  const t = useTranslations('pages.events.card');

  const isAssigned = adminIds.includes(user.id);

  return (
    <Paper
      sx={{
        p: 2,
        mb: 1,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        cursor: 'pointer',
        transition: 'all 0.2s',
        '&:hover': {
          boxShadow: 2,
          backgroundColor: 'action.hover'
        },
        borderLeft: isPinned ? 4 : 0,
        borderColor: 'primary.main'
      }}
      onClick={() => router.push(`/events/${slug}/edit`)}
    >
      {/* Pin Icon */}
      <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 40 }}>
        {isAssigned && (
          <IconButton
            size="small"
            onClick={e => {
              e.stopPropagation();
              onTogglePin?.(id);
            }}
            sx={{ color: isPinned ? 'primary.main' : 'action.disabled' }}
          >
            {isPinned ? <PushPin fontSize="small" /> : <PushPinOutlined fontSize="small" />}
          </IconButton>
        )}
      </Box>

      {/* Event Name */}
      <Box sx={{ minWidth: 200, flexGrow: 1 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 0.5 }}>
          {name}
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          {isFullySetUp ? (
            <Chip
              icon={<CheckCircle />}
              label={t('fully-set-up')}
              size="small"
              color="success"
              variant="outlined"
              sx={{ height: 20 }}
            />
          ) : (
            <Chip
              icon={<Warning />}
              label={t('missing-details')}
              size="small"
              color="warning"
              variant="outlined"
              sx={{ height: 20 }}
            />
          )}
        </Stack>
      </Box>

      {/* Location */}
      <Box sx={{ minWidth: 180, display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1 }}>
        <LocationOn color="action" fontSize="small" />
        <Typography variant="body2" color="text.secondary" noWrap>
          {location}
        </Typography>
        <Flag region={region} size={16} />
      </Box>

      {/* Date */}
      <Box sx={{ minWidth: 120, display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 1 }}>
        <CalendarMonth color="action" fontSize="small" />
        <Typography variant="body2" color="text.secondary">
          {dayjs(date).format('DD/MM/YYYY')}
        </Typography>
      </Box>

      {/* Teams */}
      <Box sx={{ minWidth: 80, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Group color="action" fontSize="small" />
        <Typography variant="body2" color="text.secondary">
          {teamCount}
        </Typography>
      </Box>

      {/* Divisions */}
      <Box sx={{ minWidth: 100, display: { xs: 'none', lg: 'flex' }, gap: 0.5 }}>
        {divisions.slice(0, 2).map(division => (
          <Chip
            key={division.id}
            label={division.name}
            size="small"
            sx={{
              height: 20,
              fontSize: '0.7rem',
              backgroundColor: division.color ? `${division.color}20` : undefined,
              borderColor: division.color || undefined
            }}
          />
        ))}
        {divisions.length > 2 && (
          <Chip
            label={`+${divisions.length - 2}`}
            size="small"
            sx={{ height: 20, fontSize: '0.7rem' }}
          />
        )}
      </Box>

      {/* Edit Button */}
      {isAssigned && (
        <Box sx={{ minWidth: 40 }}>
          <Tooltip title={t('edit')}>
            <IconButton
              size="small"
              onClick={e => {
                e.stopPropagation();
                router.push(`/events/${slug}/edit`);
              }}
            >
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      )}
    </Paper>
  );
};
