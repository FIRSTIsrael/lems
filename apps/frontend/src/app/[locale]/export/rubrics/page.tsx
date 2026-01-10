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
  Alert,
  MenuItem
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { useTranslations } from 'next-intl';

const JUDGING_CATEGORIES = [
  { value: 'innovation-project', label: 'Innovation Project' },
  { value: 'robot-design', label: 'Robot Design' },
  { value: 'core-values', label: 'Core Values' }
];

export default function ExportRubricsPage() {
  const t = useTranslations('pages.export');
  const [divisionId, setDivisionId] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleExport = async () => {
    if (!divisionId.trim() || !category) {
      setError('Division ID and category are required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(
        `/api/export/rubrics?divisionId=${divisionId}&category=${category}`
      );

      if (!response.ok) {
        throw new Error('Failed to export rubrics');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `rubrics-${category}-${divisionId}.pdf`;
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
              <h1>{t('rubrics.title')}</h1>
              <p>{t('rubrics.description')}</p>
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

            <Button
              variant="contained"
              startIcon={loading ? <CircularProgress size={20} /> : <DownloadIcon />}
              onClick={handleExport}
              disabled={loading}
              fullWidth
            >
              {loading ? 'Exporting...' : t('rubrics.export-button')}
            </Button>
          </Stack>
        </Paper>
      </Box>
    </Container>
  );
}
