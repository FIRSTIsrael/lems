'use client';

import { Box, Button, Card, CardContent, Chip, Stack, Typography } from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { useTranslations } from 'next-intl';
import { getRubricColor } from '@lems/shared/rubrics/rubric-utils';
import { JudgingCategory } from '@lems/types/judging';
import { useJudgingCategoryTranslations } from '@lems/localization';

export interface Deliberation {
  category: string;
  status: string;
  picklist: unknown[];
  startTime?: string;
}

interface CategoryDeliberationCardProps {
  category: string;
  deliberation: Deliberation | undefined;
  desiredPicklistLength: number;
  loading: boolean;
}

function getDeliberationStatusColor(
  status: string
): 'default' | 'primary' | 'success' | 'warning' | 'error' {
  switch (status) {
    case 'completed':
      return 'success';
    case 'in-progress':
      return 'primary';
    case 'not-started':
      return 'default';
    default:
      return 'default';
  }
}

function formatTime(isoString?: string): string {
  if (!isoString) return '—';
  const date = new Date(isoString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function CategoryDeliberationCard({
  category,
  deliberation,
  desiredPicklistLength,
  loading
}: CategoryDeliberationCardProps) {
  const t = useTranslations('pages.judge-advisor.awards.deliberation');
  const tStatus = useTranslations('common.statuses');
  const { getCategory } = useJudgingCategoryTranslations();

  const color = getRubricColor(category as JudgingCategory);
  const label = getCategory(category as JudgingCategory);

  return (
    <Box
      sx={{
        flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 calc(33.333% - 11px)' }
      }}
    >
      <Card
        sx={{
          height: '100%',
          backgroundColor: '#fafafa',
          borderLeft: `4px solid ${color}`,
          borderTop: `2px solid ${color}`,
          borderRight: `2px solid ${color}`,
          borderBottom: `2px solid ${color}`,
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <CardContent sx={{ flexGrow: 1 }}>
          <Typography variant="subtitle1" fontWeight={600} mb={2} color={color}>
            {label}
          </Typography>

          <Stack spacing={2}>
            {/* Status */}
            <Box>
              <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                {t('status')}
              </Typography>
              {deliberation ? (
                <Chip
                  label={tStatus(`deliberation.${deliberation.status}`)}
                  color={getDeliberationStatusColor(deliberation.status)}
                  size="small"
                  variant="outlined"
                  sx={{ fontWeight: 600 }}
                />
              ) : (
                <Typography variant="caption" color="text.secondary">
                  —
                </Typography>
              )}
            </Box>

            {/* Picklist */}
            <Box>
              <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                {t('picklist')}
              </Typography>
              {deliberation ? (
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {deliberation.picklist.length} / {desiredPicklistLength}
                </Typography>
              ) : (
                <Typography variant="caption" color="text.secondary">
                  —
                </Typography>
              )}
            </Box>

            {/* Start Time */}
            <Box>
              <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                {t('start-time')}
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {deliberation ? formatTime(deliberation.startTime) : '—'}
              </Typography>
            </Box>
          </Stack>
        </CardContent>

        {/* Action Button */}
        <CardContent sx={{ pt: 0 }}>
          <Button
            fullWidth
            size="small"
            variant="outlined"
            endIcon={<OpenInNewIcon sx={{ fontSize: 16 }} />}
            target="_blank"
            href={`/lems/deliberation/${category}`}
            disabled={loading}
            sx={{
              fontWeight: 600,
              textTransform: 'none',
              whiteSpace: 'nowrap'
            }}
          >
            {t('open')}
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}
