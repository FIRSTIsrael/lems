'use client';

import { useState, useMemo } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  InputAdornment,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
  Alert,
  Chip,
  Stack
} from '@mui/material';
import {
  Search as SearchIcon,
  ExpandMore as ExpandMoreIcon,
  QuestionAnswer as QuestionAnswerIcon
} from '@mui/icons-material';
import { useTranslations } from 'next-intl';
import useSWR from 'swr';
import { PortalFaqResponse } from '@lems/types/api/portal';

export default function FaqsPage() {
  const t = useTranslations('pages.faqs');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | false>(false);

  const { data: faqs, error } = useSWR<PortalFaqResponse[]>('/portal/faqs');

  const filteredFaqs = useMemo(() => {
    if (!faqs) return [];
    if (!searchQuery.trim()) return faqs;

    const query = searchQuery.toLowerCase();
    return faqs.filter(
      faq => faq.question.toLowerCase().includes(query) || faq.answer.toLowerCase().includes(query)
    );
  }, [faqs, searchQuery]);

  const handleAccordionChange = (id: string) => (_: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedId(isExpanded ? id : false);
  };

  const loading = !faqs && !error;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: 2,
          p: 4,
          mb: 4,
          color: 'white'
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <QuestionAnswerIcon sx={{ fontSize: 40 }} />
          <Typography variant="h3" component="h1">
            {t('title')}
          </Typography>
        </Stack>
        <Typography variant="h6" sx={{ opacity: 0.9 }}>
          {t('subtitle')}
        </Typography>
      </Box>

      {/* Search Section */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <TextField
          fullWidth
          placeholder={t('search-placeholder')}
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            )
          }}
        />
      </Paper>

      {/* Results Section */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {t('errors.load-failed')}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : filteredFaqs.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <QuestionAnswerIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {searchQuery ? t('no-results') : t('empty-state')}
          </Typography>
          {searchQuery && (
            <Typography variant="body2" color="text.secondary">
              {t('try-different-search')}
            </Typography>
          )}
        </Paper>
      ) : (
        <Box>
          <Box
            sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <Typography variant="body2" color="text.secondary">
              {t('results-count', { count: filteredFaqs.length })}
            </Typography>
            {searchQuery && (
              <Chip
                label={t('search-active')}
                onDelete={() => setSearchQuery('')}
                color="primary"
                size="small"
              />
            )}
          </Box>

          <Stack spacing={2}>
            {filteredFaqs.map(faq => (
              <Accordion
                key={faq.id}
                expanded={expandedId === faq.id}
                onChange={handleAccordionChange(faq.id)}
                sx={{
                  '&:before': { display: 'none' },
                  boxShadow: 1,
                  '&.Mui-expanded': {
                    boxShadow: 3
                  }
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  sx={{
                    '& .MuiAccordionSummary-content': {
                      my: 2
                    }
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 500 }}>
                    {faq.question}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ pt: 0, pb: 3 }}>
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ whiteSpace: 'pre-wrap' }}
                  >
                    {faq.answer}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Stack>
        </Box>
      )}
    </Container>
  );
}
