'use client';

import { useMemo, useState, useCallback } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Stack,
  TextField,
  Typography,
  Alert
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { assignPersonalAward } from '../graphql/mutations/assign-personal-award';
import { useJudgeAdvisor } from './judge-advisor-context';

export function PersonalAwardsSection() {
  const t = useTranslations('pages.judge-advisor');
  const { awards, loading } = useJudgeAdvisor();
  const [awardValues, setAwardValues] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  // Filter only personal awards
  const personalAwards = useMemo(() => {
    return awards.filter(award => award.type === 'PERSONAL').sort((a, b) => a.index - b.index);
  }, [awards]);

  const handleAwardChange = useCallback((awardId: string, value: string) => {
    setAwardValues(prev => ({
      ...prev,
      [awardId]: value
    }));
    setSubmitted(false);
  }, []);

  const handleSubmit = useCallback(async () => {
    // Call placeholder mutation for each award that has a value
    const promises = Object.entries(awardValues)
      .filter(([, value]) => value.trim() !== '')
      .map(([awardId, value]) =>
        assignPersonalAward({
          awardId,
          teamId: value,
          divisionId: ''
        })
      );

    if (promises.length > 0) {
      try {
        await Promise.all(promises);
        setSubmitted(true);
        // Reset form after 3 seconds
        setTimeout(() => setSubmitted(false), 3000);
      } catch (error) {
        console.error('Error submitting personal awards:', error);
      }
    }
  }, [awardValues]);

  if (personalAwards.length === 0) {
    return (
      <Card>
        <CardHeader title={t('awards.personal-awards.title')} />
        <CardContent>
          <Typography variant="body2" color="text.secondary">
            {t('awards.personal-awards.no-awards')}
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader title={t('awards.personal-awards.title')} />
      <CardContent>
        <Stack spacing={3}>
          {submitted && (
            <Alert severity="info">{t('awards.personal-awards.placeholder-message')}</Alert>
          )}

          <Grid container spacing={2}>
            {personalAwards.map(award => (
              <Grid size={{ xs: 12, sm: 6 }} key={award.id}>
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                    {award.name}
                    {award.isOptional && (
                      <Typography
                        component="span"
                        variant="caption"
                        color="text.secondary"
                        sx={{ ml: 1 }}
                      >
                        ({t('awards.personal-awards.optional')})
                      </Typography>
                    )}
                  </Typography>
                  {award.description && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: 'block', mb: 1 }}
                    >
                      {award.description}
                    </Typography>
                  )}
                  <TextField
                    fullWidth
                    size="small"
                    placeholder={t('awards.personal-awards.team-placeholder')}
                    value={awardValues[award.id] ?? ''}
                    onChange={e => handleAwardChange(award.id, e.target.value)}
                    disabled={loading}
                  />
                </Box>
              </Grid>
            ))}
          </Grid>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 2 }}>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={loading || personalAwards.length === 0}
            >
              {t('awards.personal-awards.submit')}
            </Button>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
