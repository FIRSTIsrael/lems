'use client';

import { useState } from 'react';
import {
  Paper,
  Typography,
  Box,
  Button,
  Stack,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress
} from '@mui/material';
import UploadIcon from '@mui/icons-material/Upload';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useTranslations } from 'next-intl';
import useSWR, { mutate } from 'swr';
import { apiFetch } from '../../../../../../../lib/fetch';

interface PitMapManagerProps {
  divisionId: string;
}

const PitMapManager: React.FC<PitMapManagerProps> = ({ divisionId }) => {
  const t = useTranslations('pages.events.venue.pit-map');
  const [uploading, setUploading] = useState(false);
  const [viewMapOpen, setViewMapOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  const {
    data: pitMapInfo,
    error: swrError,
    isLoading
  } = useSWR<{ exists: boolean; url?: string }>(
    divisionId ? `/admin/divisions/${divisionId}/pit-map` : null,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true
    }
  );

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'image/png') {
        setErrorMessage('Please select a PNG image file');
        setSuccessMessage('');
        return;
      }
      setSelectedFile(file);
      setUploadDialogOpen(true);
      setErrorMessage('');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setErrorMessage('');
    setSuccessMessage('');

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', selectedFile);

      const result = await apiFetch(`/admin/divisions/${divisionId}/pit-map`, {
        method: 'POST',
        body: formData
      });

      if (result.ok) {
        setSuccessMessage(t('upload-success'));
        mutate(`/admin/divisions/${divisionId}/pit-map`);
        setUploadDialogOpen(false);
        setSelectedFile(null);
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setErrorMessage(t('upload-error'));
      }
    } catch {
      setErrorMessage(t('upload-error'));
    } finally {
      setUploading(false);
    }
  };

  if (isLoading) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <CircularProgress />
      </Paper>
    );
  }

  if (swrError) {
    return (
      <Paper sx={{ p: 3 }}>
        <Alert severity="error">Failed to load pit map information</Alert>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        {t('title')}
      </Typography>

      <Stack direction="row" spacing={2} alignItems="center">
        {/* Upload button */}
        <Button
          variant="contained"
          component="label"
          startIcon={<UploadIcon />}
          disabled={uploading}
        >
          {t('upload-button')}
          <input
            type="file"
            accept="image/png"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
        </Button>

        {/* View current map button */}
        {pitMapInfo?.exists && (
          <Button
            variant="outlined"
            startIcon={<VisibilityIcon />}
            onClick={() => setViewMapOpen(true)}
          >
            {t('view-button')}
          </Button>
        )}
      </Stack>

      {/* Error message */}
      {errorMessage && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {errorMessage}
        </Alert>
      )}

      {/* Success message */}
      {successMessage && (
        <Alert severity="success" sx={{ mt: 2 }}>
          {successMessage}
        </Alert>
      )}

      {/* Status text */}
      <Box sx={{ mt: 2 }}>
        {pitMapInfo?.exists ? (
          <Typography variant="body2" color="success.main">
            {t('current-map')}
          </Typography>
        ) : (
          <Typography variant="body2" color="text.secondary">
            {t('no-map')}
          </Typography>
        )}
      </Box>

      {/* Upload confirmation dialog */}
      <Dialog open={uploadDialogOpen} onClose={() => !uploading && setUploadDialogOpen(false)}>
        <DialogTitle>{t('upload-button')}</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to upload this pit map? This will replace any existing pit map.
          </Typography>
          {selectedFile && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              <strong>File:</strong> {selectedFile.name}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadDialogOpen(false)} disabled={uploading}>
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            variant="contained"
            disabled={uploading}
            startIcon={uploading ? <CircularProgress size={16} /> : undefined}
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View map dialog */}
      <Dialog open={viewMapOpen} onClose={() => setViewMapOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>{t('current-map')}</DialogTitle>
        <DialogContent>
          {pitMapInfo?.url && (
            <Box sx={{ textAlign: 'center' }}>
              <img
                src={pitMapInfo.url}
                alt="Pit Map"
                style={{
                  maxWidth: '100%',
                  maxHeight: '70vh',
                  objectFit: 'contain'
                }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewMapOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default PitMapManager;
