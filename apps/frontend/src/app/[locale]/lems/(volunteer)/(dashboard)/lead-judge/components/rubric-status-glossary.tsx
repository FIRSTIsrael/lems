'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { IconButton, Popover, Box, Typography, Stack, Divider, useTheme } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { getRubricIcon } from '@lems/shared/rubrics/rubric-utils';

const STATUS_ITEMS = ['empty', 'draft', 'completed', 'locked', 'approved'] as const;

export const RubricStatusGlossary: React.FC = () => {
  const t = useTranslations('pages.lead-judge.summary.status-glossary');
  const theme = useTheme();
  const direction = theme.direction;
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

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
            right: 9,
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
            right: 9,
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
            {STATUS_ITEMS.map(status => (
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
                  {getRubricIcon(status, theme.palette.text.primary)}
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
