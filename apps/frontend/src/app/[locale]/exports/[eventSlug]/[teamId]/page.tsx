'use client';

import { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Stack,
  Button,
  CircularProgress,
  Alert,
  MenuItem,
  TextField
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { useTranslations } from 'next-intl';

const EXPORT_TYPES = [
  { value: 'scores', label: 'Export Scores' },
  { value: 'rubrics', label: 'Export Rubrics' }
];

const JUDGING_CATEGORIES = [
  { value: 'innovation-project', label: 'Innovation Project' },
  { value: 'robot-design', label: 'Robot Design' },
  { value: 'core-values', label: 'Core Values' }
];

interface ExportPageProps {
  params: {
    locale: string;
    eventSlug: string;
    teamId: string;
  };
}

export default function ExportPage({ params }: ExportPageProps) {
  const t = useTranslations('pages.export');
  const { eventSlug, teamId } = params;
  const [exportType, setExportType] = useState('scores');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleExport = async () => {
    setLoading(true);
    setError('');

    try {
      let url = `/api/export?eventSlug=${eventSlug}&teamId=${teamId}&type=${exportType}`;

      if (exportType === 'rubrics' && category) {
        url += `&category=${category}`;
      }

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Failed to export');
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;

      const contentType = response.headers.get('content-type');
      const extension = contentType?.includes('pdf') ? 'pdf' : 'csv';
      link.download = `export-${teamId}.${extension}`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
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
              <h1>{t('title')}</h1>
              <p>Event: {eventSlug}</p>
              <p>Team: {teamId}</p>
            </Box>

            {error && <Alert severity="error">{error}</Alert>}

            <TextField
              select
              label="Export Type"
              value={exportType}
              onChange={e => {
                setExportType(e.target.value);
                setCategory('');
              }}
              fullWidth
              disabled={loading}
            >
              {EXPORT_TYPES.map(type => (
                <MenuItem key={type.value} value={type.value}>
                  {type.label}
                </MenuItem>
              ))}
            </TextField>

            {exportType === 'rubrics' && (
              <TextField
                select
                label="Judging Category"
                value={category}
                onChange={e => setCategory(e.target.value)}
                fullWidth
                disabled={loading}
              >
                <MenuItem value="">Select a category</MenuItem>
                {JUDGING_CATEGORIES.map(cat => (
                  <MenuItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </MenuItem>
                ))}
              </TextField>
            )}

            <Button
              variant="contained"
              startIcon={loading ? <CircularProgress size={20} /> : <DownloadIcon />}
              onClick={handleExport}
              disabled={loading || (exportType === 'rubrics' && !category)}
              fullWidth
            >
              {loading ? 'Exporting...' : 'Export'}
            </Button>
          </Stack>
        </Paper>
      </Box>
    </Container>
  );
}
