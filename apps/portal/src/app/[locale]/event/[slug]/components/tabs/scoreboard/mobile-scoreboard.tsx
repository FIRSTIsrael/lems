'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Box, Typography, Paper, Stack, Collapse, IconButton, Chip, Divider } from '@mui/material';
import { ExpandMore, ExpandLess } from '@mui/icons-material';
import { ScoreboardEntry } from '@lems/types/api/portal/divisions';

interface MobileScoreboardProps {
  sortedData: ScoreboardEntry[];
  matchesPerTeam: number;
  eventSlug: string;
}

export const MobileScoreboard: React.FC<MobileScoreboardProps> = ({
  sortedData,
  matchesPerTeam,
  eventSlug
}) => {
  const t = useTranslations('pages.event');

  const [expandedTeams, setExpandedTeams] = useState<string[]>([]);

  if (sortedData.length === 0) {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" py={8}>
        <Typography variant="body1" color="text.secondary">
          {t('scoreboard.no-data')}
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
      {sortedData.map(entry => {
        const isExpanded = expandedTeams.includes(entry.team.id);

        const getRankColor = () => {
          switch (entry.robotGameRank) {
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
            key={entry.team.id}
            sx={{
              bgcolor: 'white',
              border: '1px solid',
              borderColor: 'grey.200'
            }}
          >
            <Box
              onClick={() => toggleTeamExpansion(entry.team.id)}
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
                label={entry.robotGameRank ?? '-'}
                size="small"
                sx={{
                  minWidth: 40,
                  fontWeight: 600,
                  bgcolor: getRankColor(),
                  fontSize: entry.robotGameRank && entry.robotGameRank ? '0.875rem' : '1.125rem',
                  color: entry.robotGameRank && entry.robotGameRank <= 3 ? 'white' : 'black',
                  border: entry.robotGameRank && entry.robotGameRank <= 3 ? 'none' : 'black',
                  mr: 2
                }}
              />

              <Box sx={{ flex: 1 }}>
                <Typography
                  component={Link}
                  href={`/event/${eventSlug}/team/${entry.team.number}`}
                  sx={{
                    textDecoration: 'none',
                    color: 'text.primary',
                    fontWeight: 600,
                    fontSize: '1rem',
                    '&:hover': {
                      color: 'primary.main'
                    }
                  }}
                >
                  {entry.team.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  #{entry.team.number}
                </Typography>
              </Box>

              <Box sx={{ textAlign: 'right', mr: 1 }}>
                <Typography variant="body2" color="text.secondary" fontSize="0.75rem">
                  {t('scoreboard.best-score')}
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
                  {t('scoreboard.match-scores')}
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {Array.from({ length: matchesPerTeam }, (_, index) => {
                    const score = entry.scores?.[index];
                    return (
                      <Box
                        key={index}
                        sx={{
                          minWidth: 60,
                          p: 1,
                          textAlign: 'center',
                          bgcolor: score ? 'rgba(25, 118, 210, 0.3)' : 'grey.100',
                          color: score ? 'primary.main' : 'text.disabled',
                          borderRadius: 1,
                          border: score === entry.maxScore ? '2px solid' : 'none',
                          borderColor: score === entry.maxScore ? 'primary.main' : 'transparent'
                        }}
                      >
                        <Typography variant="caption" display="block" fontSize="0.7rem">
                          {t('scoreboard.match')} {index + 1}
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
};
