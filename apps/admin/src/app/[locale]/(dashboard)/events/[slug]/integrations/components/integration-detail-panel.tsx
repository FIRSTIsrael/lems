'use client';

import { useState, useCallback } from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  Stack,
  Typography,
  Button,
  CircularProgress,
  Box
} from '@mui/material';
import { Cable as CableIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useTranslations } from 'next-intl';

interface IntegrationSettings {
  id: string;
  type: string;
  enabled: boolean;
  settings?: Record<string, unknown>;
}

interface IntegrationDetailPanelProps {
  integration: IntegrationSettings | null;
  getIntegrationName: (type: string) => string;
  isLoading?: boolean;
  onUpdate?: (settings: Record<string, unknown>) => void | Promise<void>;
  onDelete?: () => void | Promise<void>;
}

export const IntegrationDetailPanel: React.FC<IntegrationDetailPanelProps> = ({
  integration,
  getIntegrationName,
  isLoading = false,
  onUpdate,
  onDelete
}) => {
  const t = useTranslations('pages.events.integrations');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSave = useCallback(async () => {
    if (!onUpdate) return;
    setIsSaving(true);
    try {
      await onUpdate({});
    } finally {
      setIsSaving(false);
    }
  }, [onUpdate]);

  const handleDelete = useCallback(async () => {
    if (!onDelete) return;
    setIsDeleting(true);
    try {
      await onDelete();
    } finally {
      setIsDeleting(false);
    }
  }, [onDelete]);

  if (!integration) {
    return (
      <Card
        variant="outlined"
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'background.paper'
        }}
      >
        <CardContent
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1
          }}
        >
          <Typography color="text.secondary" align="center">
            {t('detail-panel.no-selection')}
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      variant="outlined"
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper'
      }}
    >
      <CardHeader
        avatar={<CableIcon sx={{ color: 'primary.main' }} />}
        title={
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {getIntegrationName(integration.type)}
          </Typography>
        }
        sx={{ pb: 2 }}
      />

      <CardContent
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          overflowY: 'auto',
          p: 2
        }}
      >
        {isLoading && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 200
            }}
          >
            <CircularProgress />
          </Box>
        )}

        {!isLoading && (
          <>
            <Box
              sx={{
                p: 2,
                backgroundColor: 'action.hover',
                borderRadius: 1,
                minHeight: 150,
                border: '1px dashed',
                borderColor: 'divider'
              }}
            >
              <Typography variant="caption" color="text.secondary">
                {t('detail-panel.settings-placeholder')}
              </Typography>
            </Box>

            <Stack direction="row" spacing={1} sx={{ mt: 'auto', pt: 2 }}>
              <Button
                variant="contained"
                size="small"
                disabled={isSaving || isDeleting}
                onClick={handleSave}
                startIcon={isSaving && <CircularProgress size={16} />}
              >
                {t('detail-panel.save')}
              </Button>
              <Button
                variant="outlined"
                color="error"
                size="small"
                startIcon={isDeleting ? <CircularProgress size={16} /> : <DeleteIcon />}
                disabled={isSaving || isDeleting}
                onClick={handleDelete}
              >
                {t('detail-panel.delete')}
              </Button>
            </Stack>
          </>
        )}
      </CardContent>
    </Card>
  );
};
