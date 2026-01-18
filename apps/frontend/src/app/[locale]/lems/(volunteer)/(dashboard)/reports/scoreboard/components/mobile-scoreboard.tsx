'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Box, Typography, Paper, Stack, Collapse, IconButton, Chip, Divider } from '@mui/material';
import { ExpandMore, ExpandLess } from '@mui/icons-material';
import type { ScoreboardTeam } from '../graphql/types';

interface MobileScoreboardProps {
  data: ScoreboardTeam[];
  matchesPerTeam: number;
}

export function MobileScoreboard({ data, matchesPerTeam }: MobileScoreboardProps) {
  const t = useTranslations('pages.reports.scoreboard');
  const [expandedTeams, setExpandedTeams] = useState<string[]>([]);

  if (data.length === 0) {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" py={8}>
        <Typography variant="body1" color="text.secondary">
          {t('no-data')}
        </Typography>
      </Box>
    );
  }

  const toggleTeamExpansion = (teamId: string) => {
    if (expandedTeams.includes(teamId)) {
      setExpandedTeams(prev => prev.filter(id => id !== teamId));
    } else {
      setExpandedTeams(prev => [...prev, teamId]);
    }
  };

  return (
    <Stack spacing={1}>
      {data.map(entry => {
        const isExpanded = expandedTeams.includes(entry.id);

        const getRankColor = () => {
          switch (entry.rank) {
            case 1:
              return 'gold';
            case 2:
              return 'silver';
            case 3:
              return '#CD7F32';
            default:
              return 'transparent';
          }
        };

        return (
          <Paper
            key={entry.id}
            sx={{
              bgcolor: 'white',
              border: '1px solid',
              borderColor: 'grey.200'
            }}
          >
            <Box
              onClick={() => toggleTeamExpansion(entry.id)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                p: 2,
                cursor: 'pointer',
                '&:hover': {
                  bgcolor: 'grey.50'
                }
              }}
            >
              <Chip
                label={entry.rank ?? '-'}
                size="small"
                sx={{
                  minWidth: 40,
                  fontWeight: 600,
                  bgcolor: getRankColor(),
                  fontSize: entry.rank ? '0.875rem' : '1.125rem',
                  color: entry.rank && entry.rank <= 3 ? 'white' : 'text.primary',
                  border: entry.rank && entry.rank <= 3 ? 'none' : '1px solid',
                  borderColor: entry.rank && entry.rank <= 3 ? 'transparent' : 'grey.400',
                  mr: 2
                }}
              />

              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  sx={{
                    fontWeight: 600,
                    fontSize: '1rem',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {entry.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  #{entry.number}
                </Typography>
              </Box>

              <Box sx={{ textAlign: 'right', mr: 1 }}>
                <Typography variant="body2" color="text.secondary" fontSize="0.75rem">
                  {t('best-score')}
                </Typography>
                <Typography variant="h6" fontWeight={600} color="primary.main">
                  {entry.maxScore ?? '-'}
                </Typography>
              </Box>

              <IconButton size="small">{isExpanded ? <ExpandLess /> : <ExpandMore />}</IconButton>
            </Box>

            <Collapse in={isExpanded}>
              <Divider />
              <Box sx={{ p: 2, pt: 1 }}>
                <Typography variant="body2" color="text.secondary" mb={1}>
                  {t('match-scores')}
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {Array.from({ length: matchesPerTeam }, (_, index) => {
                    const score = entry.scores[index];
                    return (
                      <Box
                        key={index}
                        sx={{
                          minWidth: 60,
                          p: 1,
                          textAlign: 'center',
                          bgcolor: score !== null ? 'rgba(25, 118, 210, 0.3)' : 'grey.100',
                          color: score !== null ? 'primary.main' : 'text.disabled',
                          borderRadius: 1,
                          border: score !== null && score === entry.maxScore ? '2px solid' : 'none',
                          borderColor:
                            score !== null && score === entry.maxScore
                              ? 'primary.main'
                              : 'transparent'
                        }}
                      >
                        <Typography variant="caption" display="block" fontSize="0.7rem">
                          {t('match')} {index + 1}
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {score ?? '-'}
                        </Typography>
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            </Collapse>
          </Paper>
        );
      })}
    </Stack>
  );
}
