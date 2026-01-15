import { TableCell, TableRow, Typography, useMediaQuery, useTheme, Chip } from '@mui/material';
import { useTranslations } from 'next-intl';
import dayjs from 'dayjs';
import type { AgendaEvent } from '../graphql/types';

interface AgendaEventRowProps {
  event: AgendaEvent;
  tableCount: number;
}

const VISIBILITY_COLORS: Record<string, string> = {
  public: '#4CAF50',
  judging: '#FF9800'
};

export const AgendaEventRow: React.FC<AgendaEventRowProps> = ({ event, tableCount }) => {
  const t = useTranslations('pages.reports.field-schedule');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const startTime = dayjs(event.startTime);
  const endTime = startTime.add(event.duration, 'seconds');
  const visibilityColor = VISIBILITY_COLORS[event.visibility] || '#9E9E9E';

  return (
    <TableRow
      sx={{
        bgcolor: `${visibilityColor}10`,
        borderLeft: `4px solid ${visibilityColor}`
      }}
    >
      <TableCell colSpan={3} align="center">
        <Typography
          fontFamily="monospace"
          fontWeight={500}
          fontSize={isMobile ? '0.75rem' : '1rem'}
        >
          {startTime.format('HH:mm')} - {endTime.format('HH:mm')}
        </Typography>
      </TableCell>
      <TableCell colSpan={tableCount} align="center">
        <Typography
          component="div"
          fontWeight={500}
          fontSize={isMobile ? '0.75rem' : '1rem'}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1
          }}
        >
          {event.title}
          <Chip
            size="small"
            label={t(`visibility.${event.visibility}`)}
            sx={{
              ml: 1,
              height: 20,
              fontSize: '0.7rem',
              backgroundColor: `${visibilityColor}20`,
              color: visibilityColor,
              fontWeight: 500
            }}
          />
        </Typography>
      </TableCell>
    </TableRow>
  );
};
