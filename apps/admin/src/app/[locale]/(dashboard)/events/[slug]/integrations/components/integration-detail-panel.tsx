import React from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  Stack,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Box
} from '@mui/material';
import { Cable as CableIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useTranslations } from 'next-intl';

interface IntegrationSettings {
  id: string;
  name: string;
  enabled: boolean;
  settings?: Record<string, unknown>;
}

interface IntegrationDetailPanelProps {
  integration: IntegrationSettings | null;
  isLoading?: boolean;
  error?: string | null;
  onSave?: (settings: Record<string, unknown>) => void | Promise<void>;
  onDelete?: () => void | Promise<void>;
  isSaving?: boolean;
  isDeleting?: boolean;
}

const IntegrationDetailPanel: React.FC<IntegrationDetailPanelProps> = ({
  integration,
  isLoading = false,
  error = null,
  onSave,
  onDelete,
  isSaving = false,
  isDeleting = false
}) => {
  const t = useTranslations('pages.events.integrations');

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
            {integration.name}
          </Typography>
        }
        sx={{
          pb: 2
        }}
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
        {/* Loading State */}
        {isLoading ? (
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
        ) : (
          <>
            {/* Error Alert */}
            {error && <Alert severity="error">{error}</Alert>}

            {/* Settings Content Placeholder */}
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

            {/* Actions */}
            <Stack direction="row" spacing={1} sx={{ mt: 'auto', pt: 2 }}>
              <Button
                variant="contained"
                size="small"
                disabled={isSaving || isDeleting}
                onClick={() => onSave?.({})}
              >
                {isSaving ? <CircularProgress size={16} /> : t('detail-panel.save')}
              </Button>
              <Button
                variant="outlined"
                color="error"
                size="small"
                startIcon={isDeleting ? <CircularProgress size={16} /> : <DeleteIcon />}
                disabled={isSaving || isDeleting}
                onClick={onDelete}
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

export default IntegrationDetailPanel;
