'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Stack,
  Container,
  Box,
  Typography,
  Alert,
  Card,
  CardContent,
  Chip,
  Divider,
  Collapse,
  IconButton
} from '@mui/material';
import { EmojiEvents, ExpandMore } from '@mui/icons-material';
import { useAwardTranslations } from '@lems/localization';
import { PageHeader } from '../../components/page-header';
import { useEvent } from '../../../components/event-context';
import { usePageData } from '../../../hooks/use-page-data';
import { GET_DIVISION_AWARDS, parseDivisionAwards, Award } from './awards-list.graphql';

export default function AwardsListPage() {
  const t = useTranslations('pages.reports.awards-list');
  const { currentDivision } = useEvent();
  const { getName, getDescription } = useAwardTranslations();
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  const {
    data: awards = [],
    loading,
    error
  } = usePageData(GET_DIVISION_AWARDS, { divisionId: currentDivision.id }, parseDivisionAwards);

  const groupedAwards = useMemo(() => {
    const groups: Record<string, Award[]> = {};
    awards.forEach(award => {
      groups[award.name] = [award];
    });
    return groups;
  }, [awards]);

  const toggleCard = (cardName: string) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(cardName)) {
        newSet.delete(cardName);
      } else {
        newSet.add(cardName);
      }
      return newSet;
    });
  };

  return (
    <Container maxWidth="lg" disableGutters>
      <Stack spacing={{ xs: 3, sm: 4, md: 5 }}>
        <PageHeader title={t('page-title')} />

        <Box
          sx={{
            px: { xs: 2, sm: 3 },
            py: { xs: 2, sm: 3, md: 4 }
          }}
        >
          <Stack spacing={3}>
            <Typography variant="body1" color="text.secondary">
              {t('description')}
            </Typography>

            {error && (
              <Alert severity="error" variant="outlined" sx={{ borderRadius: 2 }}>
                <Typography variant="body2" color="error.dark">
                  {t('error-loading')}
                </Typography>
              </Alert>
            )}

            {!error && awards.length === 0 && !loading && (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <Typography variant="h6" color="text.secondary">
                  {t('no-awards')}
                </Typography>
              </Box>
            )}

            {!error && awards.length > 0 && (
              <Stack spacing={2}>
                {Object.entries(groupedAwards).map(([name, awardList]) => {
                  const localizedName = getName(name);
                  const description = getDescription(name);
                  const isExpanded = expandedCards.has(name);

                  return (
                    <Card
                      key={name}
                      elevation={2}
                      sx={{
                        position: 'relative',
                        borderLeft: '4px solid transparent',
                        transition: 'all 0.3s ease-in-out',
                        cursor: 'pointer',
                        '&:hover': {
                          elevation: 6,
                          transform: 'translateY(-4px)',
                          borderLeftColor: 'primary.main',
                          boxShadow: theme => `0 8px 25px ${theme.palette.primary.main}20`
                        }
                      }}
                    >
                      <CardContent sx={{ p: 0 }}>
                        <Box
                          onClick={() => toggleCard(name)}
                          sx={{
                            p: 3,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            '&:hover': {
                              bgcolor: 'action.hover'
                            }
                          }}
                        >
                          <EmojiEvents sx={{ fontSize: 28, color: 'primary.main' }} />

                          <Typography variant="h6" fontWeight={600} sx={{ flexGrow: 1 }}>
                            {localizedName}
                          </Typography>

                          <Chip
                            size="small"
                            label={t('places-count', { count: awardList[0].placeCount })}
                            color="primary"
                            variant="outlined"
                            sx={{ mr: 1 }}
                          />

                          <IconButton
                            size="small"
                            sx={{
                              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                              transition: 'transform 0.3s ease-in-out'
                            }}
                          >
                            <ExpandMore />
                          </IconButton>
                        </Box>

                        <Collapse in={isExpanded} timeout={300}>
                          <Box sx={{ px: 3, pb: 3 }}>
                            <Divider sx={{ mb: 2 }} />
                            {description && (
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ lineHeight: 1.6 }}
                              >
                                {description}
                              </Typography>
                            )}
                          </Box>
                        </Collapse>
                      </CardContent>
                    </Card>
                  );
                })}
              </Stack>
            )}

            {loading && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography color="text.secondary">{t('loading')}</Typography>
              </Box>
            )}
          </Stack>
        </Box>
      </Stack>
    </Container>
  );
}
