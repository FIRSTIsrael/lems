'use client';

import { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Stack,
  TextField,
  Button,
  CircularProgress,
  Alert
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { useTranslations } from 'next-intl';

export default function ExportScoresPage() {
  const t = useTranslations('pages.export');
  const [divisionId, setDivisionId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleExport = async () => {
    if (!divisionId.trim()) {
      setError('Division ID is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/export/scores?divisionId=${divisionId}`);

      if (!response.ok) {
        throw new Error('Failed to export scores');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `scores-${divisionId}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ py: 4 }}>
        <Paper sx={{ p: 3 }}>
          <Stack spacing={3}>
            <Box>
              <h1>{t('scores.title')}</h1>
              <p>{t('scores.description')}</p>
            </Box>

            {error && <Alert severity="error">{error}</Alert>}

            <TextField
              label="Division ID"
              value={divisionId}
              onChange={e => setDivisionId(e.target.value)}
              placeholder="e.g., div-a"
              fullWidth
              disabled={loading}
            />

            <Button
              variant="contained"
              startIcon={loading ? <CircularProgress size={20} /> : <DownloadIcon />}
              onClick={handleExport}
              disabled={loading}
              fullWidth
            >
              {loading ? 'Exporting...' : t('scores.export-button')}
            </Button>
          </Stack>
        </Paper>
      </Box>
    </Container>
  );
}
