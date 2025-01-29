import router from 'next/router';
import dayjs from 'dayjs';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Divider,
  Stack,
  Typography,
  useMediaQuery
} from '@mui/material';
import Grid, { Grid2Props } from '@mui/material/Grid2';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { PortalEvent } from '@lems/types';
import theme from '../../lib/theme';

interface EventDescriptionProps extends Grid2Props {
  event: PortalEvent;
  isDesktop?: boolean;
  includeDate?: boolean;
}

const EventDescription: React.FC<EventDescriptionProps> = ({
  event,
  isDesktop = false,
  includeDate = false,
  ...props
}) => {
  return (
    <Grid {...props} container columnSpacing={4} justifyContent="space-between" alignItems="center">
      <Grid size={{ xs: 12, md: 6 }}>
        <Typography variant="h4">{event.name}</Typography>
      </Grid>
      {isDesktop ? (
        <Grid size={6}>
          <Typography variant="body1" color="text.secondary">
            📍 {event.location}
          </Typography>
          {includeDate && (
            <Typography variant="body1" color="text.secondary">
              📅 {dayjs(event.date).format('DD/MM/YYYY')}
            </Typography>
          )}
        </Grid>
      ) : (
        <>
          <Grid size={12}>
            <Typography variant="body1" color="text.secondary">
              📍 {event.location}
            </Typography>
          </Grid>
          <Grid size={12}>
            {includeDate && (
              <Typography variant="body1" color="text.secondary">
                📅 {dayjs(event.date).format('DD/MM/YYYY')}
              </Typography>
            )}
          </Grid>
        </>
      )}
    </Grid>
  );
};

interface EventLinkProps {
  event: PortalEvent;
  includeDate?: boolean;
}

const EventLink: React.FC<EventLinkProps> = ({ event, includeDate = false }) => {
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  if (!event.divisions || event.divisions.length === 0) {
    return (
      <Button
        sx={{
          color: 'inherit',
          textAlign: 'left',
          '& .MuiButton-endIcon svg': { fontSize: 24 },
          borderRadius: 3
        }}
        endIcon={<ChevronLeftIcon sx={{ color: 'rgba(0, 0, 0, 0.54)', position: 'relative' }} />}
        fullWidth
        size="small"
        onClick={() => router.push(`/events/${event.id}`)}
      >
        <EventDescription
          event={event}
          includeDate={includeDate}
          isDesktop={isDesktop}
          width="100%"
        />
      </Button>
    );
  }
  return (
    <Accordion
      elevation={0}
      disableGutters
      sx={{
        mt: '8px !important',
        '& .MuiAccordion-heading.Mui-expanded': {
          backgroundColor: 'rgba(0, 0, 0, 0.04)'
        }
      }}
    >
      <AccordionSummary
        sx={{
          py: '4px',
          px: '5px',
          borderTopLeftRadius: 3,
          borderTopRightRadius: 3,
          borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
          '& .MuiAccordionSummary-content': { m: 0 },
          transition:
            'background-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms, box-shadow 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms, border-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;',
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.04)'
          }
        }}
      >
        <EventDescription
          event={event}
          includeDate={includeDate}
          isDesktop={isDesktop}
          width="97%" // I don't know how to exclude the icon from the width calculation on the button, this is a fix for now
        />
      </AccordionSummary>
      <AccordionDetails sx={{ px: 2, py: 0, mt: 1 }}>
        <Stack spacing={1} divider={<Divider flexItem variant="middle" />}>
          {event.divisions.map(division => (
            <Button
              key={division.id}
              sx={{
                color: 'inherit',
                justifyContent: 'space-between',
                textAlign: 'left',
                '& .MuiButton-endIcon svg': { fontSize: 24 },
                minHeight: 48,
                borderRadius: 3
              }}
              endIcon={<ChevronLeftIcon sx={{ color: 'rgba(0, 0, 0, 0.54)' }} />}
              fullWidth
              size="small"
              onClick={() => router.push(`/events/${division.id}`)}
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <Box bgcolor={division.color} width={24} height={24} borderRadius={1} />
                <Typography variant="h4" fontSize="1.25rem">
                  בית {division.name}
                </Typography>
              </Stack>
            </Button>
          ))}
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
};

export default EventLink;
