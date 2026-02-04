'use client';

import { useTranslations } from 'next-intl';
import { Typography, Stack, Popover, Box, useTheme, Divider } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import PersonPinIcon from '@mui/icons-material/PersonPin';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import BlockIcon from '@mui/icons-material/Block';

type ParticipantStatus = 'ready' | 'present' | 'queued' | 'missing' | 'no-show';

const ALL_STATUSES: ParticipantStatus[] = ['ready', 'present', 'queued', 'missing', 'no-show'];

const getStatusIcon = (status: ParticipantStatus) => {
  switch (status) {
    case 'ready':
      return <CheckCircleIcon fontSize="small" color="success" />;
    case 'present':
      return <PersonPinIcon fontSize="small" color="warning" />;
    case 'queued':
      return <HourglassEmptyIcon fontSize="small" color="info" />;
    case 'missing':
      return <HelpOutlineIcon fontSize="small" color="disabled" />;
    case 'no-show':
      return <BlockIcon fontSize="small" color="error" />;
  }
};

interface StatusLegendProps {
  open: boolean;
  anchorEl: HTMLElement | null;
  onClose: () => void;
}

export const StatusLegend: React.FC<StatusLegendProps> = ({ open, anchorEl, onClose }) => {
  const t = useTranslations('pages.reports.field-status');
  const theme = useTheme();
  const direction = theme.direction;

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: direction === 'rtl' ? 'left' : 'right'
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: direction === 'rtl' ? 'left' : 'right'
      }}
      slotProps={{
        paper: {
          elevation: 8,
          sx: {
            borderRadius: 2,
            minWidth: 280,
            maxWidth: 320,
            ml: 1,
            mt: 1,
            border: `1px solid ${theme.palette.divider}`,
            overflow: 'visible'
          }
        }
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          bottom: '100%',
          right: direction === 'rtl' ? 'auto' : 9,
          left: direction === 'rtl' ? 9 : 'auto',
          width: 0,
          height: 0,
          borderLeft: '8px solid transparent',
          borderRight: '8px solid transparent',
          borderBottom: `8px solid ${theme.palette.divider}`
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: 'calc(100% - 1px)',
          right: direction === 'rtl' ? 'auto' : 9,
          left: direction === 'rtl' ? 9 : 'auto',
          width: 0,
          height: 0,
          borderLeft: '8px solid transparent',
          borderRight: '8px solid transparent',
          borderBottom: `8px solid ${theme.palette.mode === 'dark' ? theme.palette.grey[900] : theme.palette.background.paper}`
        }}
      />
      <Box sx={{ p: 2.5 }}>
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 700,
            mb: 2,
            color: theme.palette.text.primary
          }}
        >
          {t('legend.title')}
        </Typography>

        <Stack spacing={1.5} divider={<Divider />}>
          {ALL_STATUSES.map(status => (
            <Stack
              key={status}
              direction="row"
              spacing={1.5}
              alignItems="flex-start"
              sx={{ py: 0.5 }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: 24,
                  pt: 0.25
                }}
              >
                {getStatusIcon(status)}
              </Box>
              <Box>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    color: theme.palette.text.primary,
                    mb: 0.25
                  }}
                >
                  {t(`legend.statuses.${status}`)}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: theme.palette.text.secondary,
                    lineHeight: 1.4
                  }}
                >
                  {t(`legend.descriptions.${status}`)}
                </Typography>
              </Box>
            </Stack>
          ))}
        </Stack>
      </Box>
    </Popover>
  );
};
