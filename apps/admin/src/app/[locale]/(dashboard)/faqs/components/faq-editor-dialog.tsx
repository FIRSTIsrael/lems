'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Box
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { mutate } from 'swr';
import { FaqResponse } from '@lems/types/api/admin';
import { Season } from '@lems/database';
import { apiFetch } from '@lems/shared';

interface FaqEditorDialogProps {
  open: boolean;
  faq: FaqResponse | null;
  seasons: Season[];
  onClose: () => void;
}

export function FaqEditorDialog({ open, faq, seasons, onClose }: FaqEditorDialogProps) {
  const t = useTranslations('pages.faqs.editor');
  const [seasonId, setSeasonId] = useState(faq?.seasonId || '');
  const [question, setQuestion] = useState(faq?.question || '');
  const [answer, setAnswer] = useState(faq?.answer || '');
  const [displayOrder, setDisplayOrder] = useState(faq?.displayOrder?.toString() || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (faq) {
      setSeasonId(faq.seasonId);
      setQuestion(faq.question);
      setAnswer(faq.answer);
      setDisplayOrder(faq.displayOrder.toString());
    } else {
      setSeasonId(seasons[0]?.id || '');
      setQuestion('');
      setAnswer('');
      setDisplayOrder('');
    }
    setError(null);
  }, [faq, seasons]);

  const handleSubmit = async () => {
    if (!seasonId || !question.trim() || !answer.trim()) {
      setError(t('errors.required-fields'));
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const body: {
        question: string;
        answer: string;
        seasonId?: string;
        displayOrder?: number;
      } = {
        question: question.trim(),
        answer: answer.trim()
      };

      if (!faq) {
        body.seasonId = seasonId;
      }

      if (displayOrder) {
        body.displayOrder = parseInt(displayOrder);
      }

      const url = faq ? `/admin/faqs/${faq.id}` : '/admin/faqs';
      const method = faq ? 'PUT' : 'POST';

      const result = await apiFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!result.ok) {
        throw new Error('Failed to save FAQ');
      }

      // Refresh FAQ lists
      await Promise.all([
        mutate('/admin/faqs'),
        mutate(key => typeof key === 'string' && key.startsWith('/admin/faqs/season/'))
      ]);

      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.save-failed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{faq ? t('title-edit') : t('title-create')}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}

          <FormControl fullWidth disabled={!!faq}>
            <InputLabel>{t('fields.season')}</InputLabel>
            <Select
              value={seasonId}
              label={t('fields.season')}
              onChange={e => setSeasonId(e.target.value)}
            >
              {seasons.map(season => (
                <MenuItem key={season.id} value={season.id}>
                  {season.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label={t('fields.question')}
            value={question}
            onChange={e => setQuestion(e.target.value)}
            fullWidth
            required
            multiline
            rows={2}
            disabled={isSubmitting}
          />

          <TextField
            label={t('fields.answer')}
            value={answer}
            onChange={e => setAnswer(e.target.value)}
            fullWidth
            required
            multiline
            rows={6}
            disabled={isSubmitting}
          />

          <TextField
            label={t('fields.display-order')}
            value={displayOrder}
            onChange={e => setDisplayOrder(e.target.value)}
            type="number"
            fullWidth
            helperText={t('fields.display-order-help')}
            disabled={isSubmitting}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isSubmitting}>
          {t('actions.cancel')}
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isSubmitting}
          startIcon={isSubmitting ? <CircularProgress size={20} /> : undefined}
        >
          {isSubmitting ? t('actions.saving') : t('actions.save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
