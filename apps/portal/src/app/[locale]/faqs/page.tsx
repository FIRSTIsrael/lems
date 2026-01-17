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
    <Container maxWidth="lg" sx={{ py: { xs: 3, sm: 4 } }}>
      {/* Header Section */}
      <Typography
        variant="h3"
        component="h1"
        fontWeight="bold"
        sx={{
          mb: 4,
          fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.75rem' }
        }}
      >
        {t('title')}
      </Typography>

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
                  transition: 'all 0.3s ease-in-out',
                  borderLeft: '3px solid transparent',
                  '&:hover': {
                    boxShadow: 4,
                    transform: 'translateY(-4px)',
                    borderLeft: theme => `3px solid ${theme.palette.primary.main}`,
                    bgcolor: theme => `${theme.palette.primary.main}08`
                  },
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
