'use client';

import { useTranslations } from 'next-intl';
import { Typography, Stack, Popover, Box, useTheme, Divider } from '@mui/material';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import PlayCircleRoundedIcon from '@mui/icons-material/PlayCircleRounded';
import RadioButtonUncheckedRoundedIcon from '@mui/icons-material/RadioButtonUncheckedRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';

type SessionStatus = 'not-queued' | 'queued' | 'in-progress' | 'completed';

const ALL_STATUSES: SessionStatus[] = ['not-queued', 'queued', 'in-progress', 'completed'];

const getStatusIcon = (status: SessionStatus) => {
  switch (status) {
    case 'completed':
      return <CheckCircleRoundedIcon fontSize="small" color="success" />;
    case 'in-progress':
      return <PlayCircleRoundedIcon fontSize="small" color="primary" />;
    case 'queued':
      return <PeopleAltRoundedIcon fontSize="small" color="warning" />;
    case 'not-queued':
      return <RadioButtonUncheckedRoundedIcon fontSize="small" color="disabled" />;
  }
};

interface StatusLegendProps {
  open: boolean;
  anchorEl: HTMLElement | null;
  onClose: () => void;
}

export const StatusLegend: React.FC<StatusLegendProps> = ({ open, anchorEl, onClose }) => {
  const t = useTranslations('pages.judging-status');
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
