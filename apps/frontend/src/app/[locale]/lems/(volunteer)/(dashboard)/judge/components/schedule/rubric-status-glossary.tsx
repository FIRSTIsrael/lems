'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { IconButton, Popover, Box, Typography, Stack, Divider, useTheme } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CircleOutlinedIcon from '@mui/icons-material/CircleOutlined';
import EditIcon from '@mui/icons-material/Edit';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import VerifiedIcon from '@mui/icons-material/Verified';
import type { RubricStatus } from './rubric-status-button';

interface StatusGlossaryItem {
  status: RubricStatus;
  icon: React.ReactNode;
}

export const RubricStatusGlossary: React.FC = () => {
  const t = useTranslations('pages.judge.schedule.status-glossary');
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  const iconColor = theme.palette.text.secondary;
  const iconStyle = { fontSize: '1.1rem', color: iconColor };

  const statusItems: StatusGlossaryItem[] = [
    {
      status: 'empty',
      icon: <CircleOutlinedIcon sx={{ ...iconStyle, opacity: 0.4 }} />
    },
    {
      status: 'in-progress',
      icon: <EditIcon sx={iconStyle} />
    },
    {
      status: 'ready',
      icon: <CheckCircleIcon sx={iconStyle} />
    },
    {
      status: 'waiting-for-review',
      icon: <HourglassEmptyIcon sx={iconStyle} />
    },
    {
      status: 'completed',
      icon: <VerifiedIcon sx={iconStyle} />
    }
  ];

  return (
    <>
      <IconButton
        onClick={handleClick}
        size="small"
        sx={{
          color: theme.palette.text.secondary,
          transition: 'all 0.2s',
          '&:hover': {
            color: theme.palette.primary.main,
            backgroundColor:
              theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)'
          }
        }}
        aria-label={t('aria-label')}
      >
        <InfoOutlinedIcon fontSize="small" />
      </IconButton>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
        slotProps={{
          paper: {
            elevation: 8,
            sx: {
              borderRadius: 2,
              minWidth: 280,
              maxWidth: 320,
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
            top: -8,
            right: 12,
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
            top: -7,
            right: 12,
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
            {t('title')}
          </Typography>

          <Stack spacing={1.5} divider={<Divider />}>
            {statusItems.map(({ status, icon }) => (
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
                  {icon}
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
                    {t(`statuses.${status}.label`)}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: theme.palette.text.secondary,
                      lineHeight: 1.4
                    }}
                  >
                    {t(`statuses.${status}.description`)}
                  </Typography>
                </Box>
              </Stack>
            ))}
          </Stack>
        </Box>
      </Popover>
    </>
  );
};
