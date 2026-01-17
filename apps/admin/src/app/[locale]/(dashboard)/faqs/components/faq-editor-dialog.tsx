'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Box,
  Paper,
  Typography,
  Tooltip
} from '@mui/material';
import { FormatBold, FormatItalic, Palette } from '@mui/icons-material';
import { useTranslations } from 'next-intl';
import { mutate } from 'swr';
import { FaqResponse } from '@lems/types/api/admin';
import { Season } from '@lems/database';
import { apiFetch, ColorPicker } from '@lems/shared';
import { HsvaColor, hexToHsva, hsvaToHex } from '@uiw/react-color';

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
  const [textColor, setTextColor] = useState<HsvaColor>(hexToHsva('#000000'));
  const [usedColors, setUsedColors] = useState<string[]>(['#000000']);
  const editorRef = useRef<HTMLDivElement>(null);
  const selectionRef = useRef<Range | null>(null);

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

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== answer) {
      editorRef.current.innerHTML = answer;
    }
  }, [answer]);

  useEffect(() => {
    const colors = extractColors(answer);
    setUsedColors(colors.length > 0 ? colors : ['#000000']);
  }, [answer]);

  const saveSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      selectionRef.current = selection.getRangeAt(0);
    }
  };

  const restoreSelection = () => {
    const selection = window.getSelection();
    if (selectionRef.current && selection) {
      selection.removeAllRanges();
      selection.addRange(selectionRef.current);
    }
  };

  const applyCommand = (command: string, value?: string) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    restoreSelection();
    document.execCommand(command, false, value);
    setAnswer(editorRef.current.innerHTML);
  };

  const currentColor = hsvaToHex(textColor);
  const applyColor = (color: string) => {
    setTextColor(hexToHsva(color));
    applyCommand('foreColor', color);
  };

  const extractColors = (html: string) => {
    const colors = new Set<string>();
    const colorRegexes = [/color\s*=\s*"?([#a-fA-F0-9]{3,7})"?/g, /color\s*:\s*([^;"']+)/g];

    colorRegexes.forEach(regex => {
      let match = regex.exec(html);
      while (match) {
        const color = match[1].trim();
        if (color.startsWith('#')) {
          colors.add(color.toLowerCase());
        }
        match = regex.exec(html);
      }
    });

    return Array.from(colors);
  };

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

          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              {t('fields.answer')}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Tooltip title={t('toolbar.bold')}>
                <span>
                  <IconButton
                    size="small"
                    onClick={() => applyCommand('bold')}
                    disabled={isSubmitting}
                    sx={{
                      '&:hover': {
                        backgroundColor: 'action.hover'
                      }
                    }}
                  >
                    <FormatBold />
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip title={t('toolbar.italic')}>
                <span>
                  <IconButton
                    size="small"
                    onClick={() => applyCommand('italic')}
                    disabled={isSubmitting}
                    sx={{
                      '&:hover': {
                        backgroundColor: 'action.hover'
                      }
                    }}
                  >
                    <FormatItalic />
                  </IconButton>
                </span>
              </Tooltip>
              <ColorPicker value={textColor} onChange={color => applyColor(hsvaToHex(color))}>
                <IconButton
                  size="small"
                  onMouseDown={saveSelection}
                  onClick={() => applyCommand('foreColor', currentColor)}
                  disabled={isSubmitting}
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    '&:hover': {
                      backgroundColor: 'action.hover'
                    }
                  }}
                >
                  <Palette sx={{ color: currentColor }} />
                </IconButton>
              </ColorPicker>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {usedColors
                  .filter(color => color.toLowerCase() !== currentColor.toLowerCase())
                  .map(color => (
                    <Tooltip key={color} title={color}>
                      <Box
                        onClick={() => applyColor(color)}
                        sx={{
                          width: 18,
                          height: 18,
                          borderRadius: '50%',
                          bgcolor: color,
                          cursor: isSubmitting ? 'default' : 'pointer',
                          border: '1px solid',
                          borderColor: 'divider'
                        }}
                      />
                    </Tooltip>
                  ))}
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    bgcolor: currentColor,
                    border: '1px solid',
                    borderColor: 'divider',
                    boxShadow: theme => `0 0 0 2px ${theme.palette.primary.main}`
                  }}
                />
                <Typography
                  variant="caption"
                  sx={{ fontFamily: 'monospace', color: 'text.secondary' }}
                >
                  {currentColor}
                </Typography>
              </Box>
            </Box>
            <Paper variant="outlined" sx={{ p: 2, minHeight: 180 }}>
              <Box
                ref={editorRef}
                contentEditable={!isSubmitting}
                role="textbox"
                aria-label={t('fields.answer')}
                onInput={() => setAnswer(editorRef.current?.innerHTML ?? '')}
                onBlur={() => setAnswer(editorRef.current?.innerHTML ?? '')}
                onMouseUp={saveSelection}
                onKeyUp={saveSelection}
                sx={{
                  outline: 'none',
                  minHeight: 140,
                  '&:empty:before': {
                    content: '""'
                  }
                }}
              />
            </Paper>
          </Box>

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
