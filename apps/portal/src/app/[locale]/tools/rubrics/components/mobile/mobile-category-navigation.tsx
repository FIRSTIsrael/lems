'use client';

import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useJudgingCategoryTranslations } from '@lems/localization';
import { JUDGING_CATEGORIES } from '@lems/types/judging';
import { getCategoryColor } from '../../rubric-utils';
import { useRubricContext } from '../rubric-context';

export const MobileCategoryNavigation: React.FC = () => {
  const theme = useTheme();
  const t = useTranslations('pages.tools.rubrics.navigation');
  const { getCategory } = useJudgingCategoryTranslations();
  const { category: currentCategory, setCategory } = useRubricContext();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        mb: 3,
        p: 2,
        backgroundColor: theme.palette.background.paper,
        borderRadius: 2,
        boxShadow:
          theme.palette.mode === 'dark'
            ? '0 2px 8px rgba(0, 0, 0, 0.4)'
            : '0 2px 8px rgba(0, 0, 0, 0.08)'
      }}
    >
      <Typography
        variant="caption"
        sx={{
          color: theme.palette.text.secondary,
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          fontSize: '0.7rem'
        }}
      >
        {t('title')}
      </Typography>

      <Box
        sx={{
          display: 'flex',
          gap: 1,
          flexWrap: 'wrap',
          pb: 0.5
        }}
      >
        {JUDGING_CATEGORIES.map(category => {
          const isActive = category === currentCategory;
          const categoryColor = getCategoryColor(category);

          return (
            <Box
              key={category}
              onClick={() => setCategory(category)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.75,
                px: 1.5,
                py: 0.75,
                borderRadius: 1,
                backgroundColor: isActive
                  ? theme.palette.mode === 'dark'
                    ? `${categoryColor}20`
                    : `${categoryColor}10`
                  : 'transparent',
                border: '1px solid',
                borderColor: isActive ? categoryColor : theme.palette.divider,
                cursor: 'pointer',
                transition: 'all 0.15s ease-in-out',
                flex: '1 1 auto',
                minWidth: '120px',
                justifyContent: 'center',
                '&:hover': {
                  backgroundColor:
                    theme.palette.mode === 'dark' ? `${categoryColor}30` : `${categoryColor}15`,
                  borderColor: categoryColor
                },
                '&:active': {
                  transform: 'scale(0.98)'
                }
              }}
            >
              <Box
                sx={{
                  width: 4,
                  height: 4,
                  borderRadius: '50%',
                  backgroundColor: categoryColor,
                  opacity: isActive ? 1 : 0.5,
                  transition: 'opacity 0.15s'
                }}
              />
              <Typography
                variant="caption"
                sx={{
                  fontWeight: isActive ? 700 : 600,
                  fontSize: '0.75rem',
                  color: isActive ? categoryColor : theme.palette.text.secondary,
                  transition: 'color 0.15s',
                  whiteSpace: 'nowrap'
                }}
              >
                {getCategory(category)}
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};
