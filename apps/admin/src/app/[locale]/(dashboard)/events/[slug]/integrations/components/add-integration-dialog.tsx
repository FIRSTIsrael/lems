import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  Typography,
  CircularProgress,
  Alert,
  Box,
  Avatar
} from '@mui/material';
import { useTranslations } from 'next-intl';
import {
  Search as SearchIcon,
  Webhook as WebhookIcon,
  Email as EmailIcon,
  ChatBubble as SlackIcon,
  TableChart as GoogleSheetsIcon,
  Download as CsvExportIcon
} from '@mui/icons-material';

export interface DialogComponentProps {
  close: () => void;
}

interface IntegrationOption {
  id: string;
  name: string;
  description?: string;
  icon?: React.ReactElement;
}

interface AddIntegrationDialogProps extends DialogComponentProps {
  onAdd?: (integrationId: string) => void | Promise<void>;
  existingIntegrationIds?: string[];
}

// Mock integration types - will be replaced with API call
const AVAILABLE_INTEGRATIONS: IntegrationOption[] = [
  {
    id: 'webhook',
    name: 'Webhook',
    description: 'Send events to external URLs',
    icon: <WebhookIcon />
  },
  {
    id: 'email',
    name: 'Email Notifications',
    description: 'Send email alerts and updates',
    icon: <EmailIcon />
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Integrate with Slack workspace',
    icon: <SlackIcon />
  },
  {
    id: 'google-sheets',
    name: 'Google Sheets',
    description: 'Sync data with Google Sheets',
    icon: <GoogleSheetsIcon />
  },
  {
    id: 'csv-export',
    name: 'CSV Export',
    description: 'Export event data as CSV',
    icon: <CsvExportIcon />
  }
];

const AddIntegrationDialog: React.FC<AddIntegrationDialogProps> = ({
  close,
  onAdd,
  existingIntegrationIds = []
}) => {
  const t = useTranslations('pages.events.integrations');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filteredIntegrations = AVAILABLE_INTEGRATIONS.filter(
    integration =>
      !existingIntegrationIds.includes(integration.id) &&
      (integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        integration.description?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleAdd = async () => {
    if (!selectedId) return;

    try {
      setIsLoading(true);
      setError(null);

      if (onAdd) {
        await onAdd(selectedId);
      }

      close();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('add-dialog.error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      open
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          height: '80vh',
          maxHeight: '600px',
          display: 'flex',
          flexDirection: 'column'
        }
      }}
    >
      <DialogTitle>{t('add-dialog.title')}</DialogTitle>

      <DialogContent
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          flex: 1,
          minHeight: 0,
          pt: 2
        }}
      >
        {/* Search Field */}
        <TextField
          fullWidth
          placeholder={t('add-dialog.search-placeholder')}
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          slotProps={{
            input: {
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
            }
          }}
        />

        {/* Error Message */}
        {error && <Alert severity="error">{error}</Alert>}

        {/* Integration List - Scrollable */}
        {filteredIntegrations.length > 0 ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
              overflowY: 'auto',
              flex: 1,
              minHeight: 0,
              pr: 1
            }}
          >
            {filteredIntegrations.map(integration => (
              <Box
                key={integration.id}
                onClick={() => setSelectedId(integration.id)}
                sx={{
                  p: 2,
                  border: '1px solid',
                  borderColor: selectedId === integration.id ? 'primary.main' : 'divider',
                  borderRadius: 1,
                  cursor: 'pointer',
                  backgroundColor:
                    selectedId === integration.id ? 'action.selected' : 'background.paper',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  flexShrink: 0,
                  '&:hover': {
                    borderColor: 'primary.main',
                    backgroundColor: 'action.hover'
                  }
                }}
              >
                {/* Icon */}
                {integration.icon && (
                  <Avatar
                    sx={{
                      bgcolor: 'action.hover',
                      color: 'primary.main',
                      width: 40,
                      height: 40,
                      flexShrink: 0
                    }}
                  >
                    {integration.icon}
                  </Avatar>
                )}

                {/* Text Content */}
                <Stack spacing={0.25} flex={1}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {integration.name}
                  </Typography>
                  {integration.description && (
                    <Typography variant="caption" color="text.secondary">
                      {integration.description}
                    </Typography>
                  )}
                </Stack>
              </Box>
            ))}
          </Box>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
            <Typography color="text.secondary" align="center">
              {searchQuery ? t('add-dialog.no-results') : t('add-dialog.no-available-integrations')}
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={close} disabled={isLoading}>
          {t('add-dialog.cancel')}
        </Button>
        <Button
          onClick={handleAdd}
          variant="contained"
          disabled={!selectedId || isLoading}
          startIcon={isLoading ? <CircularProgress size={16} /> : undefined}
        >
          {isLoading ? t('add-dialog.adding') : t('add-dialog.add')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddIntegrationDialog;
