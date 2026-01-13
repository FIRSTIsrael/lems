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
  Alert,
  Paper,
  useTheme,
  alpha
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { useAwardTranslations } from '@lems/localization';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SendIcon from '@mui/icons-material/Send';
import { assignPersonalAward } from '../graphql/mutations/assign-personal-award';
import { useJudgeAdvisor } from './judge-advisor-context';

export function PersonalAwardsSection() {
  const t = useTranslations('pages.judge-advisor.awards.personal-awards');
  const { getDescription } = useAwardTranslations();
  const { awards, loading } = useJudgeAdvisor();
  const [awardValues, setAwardValues] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const theme = useTheme();

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
        <CardHeader
          title={t('title')}
          slotProps={{ title: { variant: 'h6' } }}
          avatar={<EmojiEventsIcon sx={{ color: 'primary.main' }} />}
        />
        <CardContent>
          <Paper
            sx={{
              p: 3,
              textAlign: 'center',
              backgroundColor: alpha(theme.palette.info.main, 0.05),
              borderLeft: `4px solid ${theme.palette.info.main}`
            }}
          >
            <Typography variant="body2" color="text.secondary">
              {t('no-awards')}
            </Typography>
          </Paper>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader
        title={t('title')}
        slotProps={{ title: { variant: 'h6' } }}
        avatar={<EmojiEventsIcon sx={{ color: 'primary.main' }} />}
        subheader={`${personalAwards.length} award${personalAwards.length !== 1 ? 's' : ''}`}
      />
      <CardContent>
        <Stack spacing={3}>
          {submitted && (
            <Alert
              severity="success"
              icon={<CheckCircleIcon />}
              onClose={() => setSubmitted(false)}
            >
              {t('placeholder-message')}
            </Alert>
          )}

          <Grid container spacing={2}>
            {personalAwards.map(award => (
              <Grid size={{ xs: 12, sm: 6 }} key={award.id}>
                <Paper
                  sx={{
                    p: 2,
                    backgroundColor: alpha(theme.palette.primary.main, 0.03),
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                    transition: 'all 0.2s',
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.05),
                      borderColor: theme.palette.primary.main
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1 }}>
                    <EmojiEventsIcon
                      sx={{
                        fontSize: 20,
                        color: 'primary.main',
                        mt: 0.25
                      }}
                    />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {award.name}
                      </Typography>
                      {award.isOptional && (
                        <Typography
                          component="span"
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: 'block', mt: 0.25 }}
                        >
                          ({t('optional')})
                        </Typography>
                      )}
                    </Box>
                  </Box>
                  <Box sx={{ mb: 1.5 }}>
                    {getDescription(award.id)}
                  </Box>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder={t('team-placeholder')}
                    value={awardValues[award.id] ?? ''}
                    onChange={e => handleAwardChange(award.id, e.target.value)}
                    disabled={loading}
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'background.paper'
                      }
                    }}
                  />
                </Paper>
              </Grid>
            ))}
          </Grid>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 1 }}>
            <Button
              variant="contained"
              size="large"
              onClick={handleSubmit}
              disabled={loading || personalAwards.length === 0}
              endIcon={<SendIcon />}
              sx={{
                fontWeight: 600,
                textTransform: 'none',
                fontSize: '1rem',
                px: 3
              }}
            >
              {t('submit')}
            </Button>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
