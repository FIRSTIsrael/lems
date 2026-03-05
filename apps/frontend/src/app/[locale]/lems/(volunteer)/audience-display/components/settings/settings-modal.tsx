'use client';

import { useTranslations } from 'next-intl';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Box,
  Stack,
  useTheme
} from '@mui/material';
import { Close, Settings } from '@mui/icons-material';
import { SettingsLanguageSwitcher } from './language-switcher';
import { SettingsLogoutButton } from './logout-button';

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ open, onClose }) => {
  const theme = useTheme();
  const t = useTranslations('pages.audience-display');

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      slotProps={{
        backdrop: {
          sx: {
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(2px)',
            transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)'
          }
        },
        transition: {
          timeout: {
            enter: 300,
            exit: 200
          }
        },
        paper: {
          sx: {
            borderRadius: 2,
            backdropFilter: 'blur(4px)',
            backgroundImage: 'none',
            boxShadow: `0 20px 60px rgba(0, 0, 0, 0.3)`
          }
        }
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pb: 2,
          borderBottom: `1px solid ${theme.palette.divider}`,
          backgroundImage: `linear-gradient(135deg, ${theme.palette.primary.main}08, ${theme.palette.secondary.main}08)`,
          fontWeight: 600
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Settings fontSize="medium" />
          {t('settings')}
        </Box>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            color: 'text.secondary',
            '&:hover': {
              backgroundColor: theme.palette.action.hover,
              color: 'text.primary'
            },
            transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          <Close fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent
        sx={{
          py: 3,
          backgroundImage: `linear-gradient(to bottom, ${theme.palette.background.paper}, ${theme.palette.grey[50]})`
        }}
      >
        <Stack spacing={3} pt={3} pb={2}>
          <Box>
            <SettingsLanguageSwitcher onLanguageChange={onClose} />
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions
        sx={{
          padding: 2,
          borderTop: `1px solid ${theme.palette.divider}`,
          backgroundImage: `linear-gradient(to top, ${theme.palette.grey[50]}, ${theme.palette.background.paper})`
        }}
      >
        <SettingsLogoutButton onClose={onClose} />
      </DialogActions>
    </Dialog>
  );
};
