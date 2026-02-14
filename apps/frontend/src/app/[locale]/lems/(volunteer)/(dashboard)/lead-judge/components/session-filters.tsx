import { useMemo } from 'react';
import {
  Stack,
  TextField,
  Typography,
  Paper,
  Button,
  ButtonGroup,
  IconButton,
  Tooltip,
  Box
} from '@mui/material';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';
import { useTranslations } from 'next-intl';
import { useFilteredSessions } from '../hooks/use-filtered-sessions';
import { useLeadJudge } from './lead-judge-context';
import { useFilters } from './filters-context';
import { StatusFilterSelector } from './status-filter-selector';

export const SessionFilters: React.FC = () => {
  const t = useTranslations('pages.lead-judge.list');
  const { sessions } = useLeadJudge();
  const {
    teamFilter,
    setTeamFilter,
    statusFilter,
    setStatusFilter,
    roomFilter,
    setRoomFilter,
    sessionNumberFilter,
    setSessionNumberFilter,
    sortBy,
    setSortBy,
    clearFilters
  } = useFilters();

  const filteredSessions = useFilteredSessions(sessions, {
    teamFilter,
    statusFilter,
    roomFilter,
    sessionNumberFilter,
    sortBy
  });

  const sessionStatuses = ['not-started', 'in-progress', 'completed'];

  // Extract unique rooms and session numbers
  const availableRooms = useMemo(() => {
    const rooms = new Set(sessions.map(s => s.room.name));
    return Array.from(rooms).sort();
  }, [sessions]);

  const availableSessionNumbers = useMemo(() => {
    const numbers = new Set(sessions.map(s => s.number));
    return Array.from(numbers).sort((a, b) => a - b);
  }, [sessions]);

  return (
    <Paper sx={{ p: 2, borderRadius: 2 }}>
      <Stack spacing={2}>
        <TextField
          label={t('filter.team')}
          placeholder={t('filter.team-placeholder')}
          value={teamFilter}
          onChange={e => setTeamFilter(e.target.value)}
          size="small"
          fullWidth
        />

        <StatusFilterSelector
          statuses={sessionStatuses}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          isStatusFilter={true}
          filterType="status"
        />
        <StatusFilterSelector
          statuses={availableRooms.map(r => r)}
          statusFilter={roomFilter}
          setStatusFilter={setRoomFilter}
          filterLabel={t('filter.room') || 'Room'}
          isStatusFilter={false}
          filterType="room"
        />
        <StatusFilterSelector
          statuses={availableSessionNumbers.map(n => `#${n}`)}
          statusFilter={sessionNumberFilter.map(n => `#${n}`)}
          setStatusFilter={values => {
            const numbers = values.map(v => parseInt(v.slice(1), 10));
            setSessionNumberFilter(numbers);
          }}
          filterLabel={t('filter.session') || 'Session #'}
          isStatusFilter={false}
          filterType="session"
        />

        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="caption" color="textSecondary" sx={{ whiteSpace: 'nowrap' }}>
              {t('filter.results')}: <strong>{filteredSessions.length}</strong>
            </Typography>
          </Box>

          <Tooltip title={t('filter.clear')}>
            <span>
              <IconButton
                size="small"
                onClick={clearFilters}
                disabled={
                  !teamFilter &&
                  statusFilter.length === 0 &&
                  roomFilter.length === 0 &&
                  sessionNumberFilter.length === 0
                }
              >
                <FilterAltOffIcon />
              </IconButton>
            </span>
          </Tooltip>
        </Stack>

        <ButtonGroup size="small" variant="outlined" fullWidth>
          <Button
            onClick={() => setSortBy('room')}
            variant={sortBy === 'room' ? 'contained' : 'outlined'}
          >
            {t('sort.room')}
          </Button>
          <Button
            onClick={() => setSortBy('session')}
            variant={sortBy === 'session' ? 'contained' : 'outlined'}
          >
            {t('sort.session')}
          </Button>
        </ButtonGroup>
      </Stack>
    </Paper>
  );
};
