'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Card,
  CardContent,
  Box,
  Typography,
  Chip,
  Divider,
  Collapse,
  IconButton
} from '@mui/material';
import { EmojiEvents, ExpandMore } from '@mui/icons-material';
import { useAwardTranslations } from '@lems/localization';
import { Award } from '../graphql';

interface AwardCardProps {
  name: string;
  awardList: Award[];
}

export function AwardCard({ name, awardList }: AwardCardProps) {
  const t = useTranslations('pages.reports.awards-list');
  const { getName, getDescription } = useAwardTranslations();
  const [isExpanded, setIsExpanded] = useState(false);

  const localizedName = getName(name);
  const description = getDescription(name);

  const toggleCard = () => {
    setIsExpanded(prev => !prev);
  };

  return (
    <Card
      elevation={2}
      sx={{
        position: 'relative',
        borderLeft: '4px solid transparent',
        transition: 'all 0.3s ease-in-out',
        cursor: 'pointer',
        '&:hover': {
          elevation: 6,
          transform: 'translateY(-4px)',
          borderLeftColor: 'primary.main'
        }
      }}
    >
      <CardContent sx={{ p: 0 }}>
        <Box
          onClick={toggleCard}
          sx={{
            p: 3,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 2
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
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                {description}
              </Typography>
            )}
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
}
