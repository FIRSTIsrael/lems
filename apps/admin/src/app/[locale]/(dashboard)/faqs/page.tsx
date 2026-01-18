'use client';

import { useState } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Button,
  Typography,
  Box,
  Chip,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { useTranslations } from 'next-intl';
import useSWR from 'swr';
import { FaqResponse } from '@lems/types/api/admin';
import { Season } from '@lems/database';
import { useSession } from '../components/session-context';
import { FaqEditorDialog } from './components/faq-editor-dialog';
import { DeleteConfirmDialog } from './components/delete-confirm-dialog';

export default function FaqsPage() {
  const t = useTranslations('pages.faqs');
  const { permissions } = useSession();
  const hasPermission = permissions.includes('MANAGE_FAQ');
  const [selectedSeasonId, setSelectedSeasonId] = useState<string>('all');
  const [editingFaq, setEditingFaq] = useState<FaqResponse | null>(null);
  const [deletingFaq, setDeletingFaq] = useState<FaqResponse | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const { data: seasons, error: seasonsError } = useSWR<Season[]>('/admin/seasons');
  const { data: faqs, error: faqsError } = useSWR<FaqResponse[]>(
    selectedSeasonId === 'all' ? '/admin/faqs' : `/admin/faqs/season/${selectedSeasonId}`
  );

  if (!hasPermission) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{t('errors.no-permission')}</Alert>
      </Box>
    );
  }

  const loading = !faqs || !seasons;
  const error = faqsError || seasonsError;

  const handleEdit = (faq: FaqResponse) => {
    setEditingFaq(faq);
  };

  const handleDelete = (faq: FaqResponse) => {
    setDeletingFaq(faq);
  };

  const handleCreate = () => {
    setIsCreating(true);
  };

  const handleCloseDialog = () => {
    setEditingFaq(null);
    setIsCreating(false);
  };

  const handleCloseDeleteDialog = () => {
    setDeletingFaq(null);
  };

  const getSeasonName = (seasonId: string) => {
    const season = seasons?.find(s => s.id === seasonId);
    return season?.name || seasonId;
  };

  const stripHtml = (html: string) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">{t('title')}</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreate}
          disabled={loading}
        >
          {t('actions.create')}
        </Button>
      </Box>

      <Box sx={{ mb: 3 }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>{t('filter.season')}</InputLabel>
          <Select
            value={selectedSeasonId}
            label={t('filter.season')}
            onChange={e => setSelectedSeasonId(e.target.value)}
            disabled={loading}
          >
            <MenuItem value="all">{t('filter.all-seasons')}</MenuItem>
            {seasons?.map(season => (
              <MenuItem key={season.id} value={season.id}>
                {season.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {t('errors.load-failed')}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('table.question')}</TableCell>
                <TableCell>{t('table.answer')}</TableCell>
                <TableCell>{t('table.season')}</TableCell>
                <TableCell>{t('table.order')}</TableCell>
                <TableCell align="right">{t('table.actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {faqs && faqs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography color="text.secondary" sx={{ py: 4 }}>
                      {t('empty-state')}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                faqs?.map(faq => (
                  <TableRow key={faq.id} hover>
                    <TableCell sx={{ maxWidth: 300 }}>
                      <Typography variant="body2" noWrap>
                        {faq.question}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ maxWidth: 400 }}>
                      <Typography variant="body2" noWrap color="text.secondary">
                        {stripHtml(faq.answer)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={getSeasonName(faq.seasonId)} size="small" />
                    </TableCell>
                    <TableCell>{faq.displayOrder}</TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => handleEdit(faq)} color="primary">
                        <EditIcon />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDelete(faq)} color="error">
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {(isCreating || editingFaq) && (
        <FaqEditorDialog
          open={true}
          faq={editingFaq}
          seasons={seasons || []}
          onClose={handleCloseDialog}
        />
      )}

      {deletingFaq && (
        <DeleteConfirmDialog open={true} faq={deletingFaq} onClose={handleCloseDeleteDialog} />
      )}
    </Box>
  );
}
