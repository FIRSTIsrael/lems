'use client';

import { useMemo, useCallback, useState } from 'react';
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
import { Search as SearchIcon } from '@mui/icons-material';
import { IntegrationConfig } from '@lems/shared';

export interface DialogComponentProps {
  close: () => void;
}

interface AddIntegrationDialogProps extends DialogComponentProps {
  onAdd?: (integrationType: string, settings: Record<string, unknown>) => void | Promise<void>;
  availableIntegrations?: IntegrationConfig[];
}

export const AddIntegrationDialog: React.FC<AddIntegrationDialogProps> = ({
  close,
  onAdd,
  availableIntegrations = []
}) => {
  const t = useTranslations('pages.events.integrations');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getIntegrationName = useCallback(
    (type: string): string => {
      const name = t(`integration-types.${type}.name`);
      return name !== `integration-types.${type}.name` ? name : type;
    },
    [t]
  );

  const getIntegrationDescription = useCallback(
    (type: string): string => {
      const description = t(`integration-types.${type}.description`);
      return description !== `integration-types.${type}.description` ? description : '';
    },
    [t]
  );

  const filteredIntegrations = useMemo(
    () =>
      availableIntegrations.filter(integration => {
        const name = getIntegrationName(integration.type);
        const description = getIntegrationDescription(integration.type);
        return (
          name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          description.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }),
    [availableIntegrations, searchQuery, getIntegrationName, getIntegrationDescription]
  );

  const handleAdd = useCallback(async () => {
    if (!selectedType) return;

    try {
      setIsLoading(true);
      setError(null);

      if (onAdd) {
        await onAdd(selectedType, {});
      }

      close();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('add-dialog.error'));
    } finally {
      setIsLoading(false);
    }
  }, [selectedType, onAdd, close, t]);

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

        {error && <Alert severity="error">{error}</Alert>}

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
                key={integration.type}
                onClick={() => setSelectedType(integration.type)}
                sx={{
                  p: 2,
                  border: '1px solid',
                  borderColor: selectedType === integration.type ? 'primary.main' : 'divider',
                  borderRadius: 1,
                  cursor: 'pointer',
                  backgroundColor:
                    selectedType === integration.type ? 'action.selected' : 'background.paper',
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
                <Avatar
                  sx={{
                    bgcolor: 'action.hover',
                    color: 'primary.main',
                    width: 40,
                    height: 40,
                    flexShrink: 0
                  }}
                >
                  {integration.type === 'first-israel-dashboard' ? '🎯' : '🔌'}
                </Avatar>

                <Stack spacing={0.25} flex={1}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {getIntegrationName(integration.type)}
                  </Typography>
                  {getIntegrationDescription(integration.type) && (
                    <Typography variant="caption" color="text.secondary">
                      {getIntegrationDescription(integration.type)}
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
          disabled={!selectedType || isLoading}
          startIcon={isLoading ? <CircularProgress size={16} /> : undefined}
        >
          {isLoading ? t('add-dialog.adding') : t('add-dialog.add')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export interface DialogComponentProps {
  close: () => void;
}
