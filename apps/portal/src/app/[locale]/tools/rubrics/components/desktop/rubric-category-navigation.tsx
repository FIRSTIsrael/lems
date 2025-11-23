'use client';

import { TableRow, TableCell, Box, Typography, useTheme } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useJudgingCategoryTranslations } from '@lems/localization';
import { JudgingCategoryTypes } from '@lems/types';
import { getCategoryColor } from '../../rubric-utils';
import { useRubricContext } from '../rubric-context';

export const RubricCategoryNavigation: React.FC = () => {
  const theme = useTheme();
  const t = useTranslations('pages.rubric.navigation');
  const { getCategory } = useJudgingCategoryTranslations();
  const { category: currentCategory, setCategory } = useRubricContext();

  return (
    <TableRow>
      <TableCell
        colSpan={4}
        sx={{
          borderRadius: '12px 12px 0 0',
          py: 2,
          px: 3,
          backgroundColor: theme.palette.background.paper,
          boxShadow:
            theme.palette.mode === 'dark'
              ? '0 2px 8px rgba(0, 0, 0, 0.4)'
              : '0 2px 8px rgba(0, 0, 0, 0.08)'
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            flexWrap: 'wrap'
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: theme.palette.text.secondary,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              fontSize: '0.7rem',
              minWidth: '120px'
            }}
          >
            {t('title')}
          </Typography>

          <Box
            sx={{
              display: 'flex',
              gap: 1.5,
              flex: 1,
              flexWrap: 'wrap'
            }}
          >
            {JudgingCategoryTypes.map(category => {
              const isActive = category === currentCategory;
              const categoryColor = getCategoryColor(category);

              return (
                <Box
                  key={category}
                  onClick={() => setCategory(category)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    px: 2,
                    py: 1,
                    borderRadius: 1.5,
                    backgroundColor: isActive
                      ? theme.palette.mode === 'dark'
                        ? `${categoryColor}20`
                        : `${categoryColor}10`
                      : 'transparent',
                    border: '1.5px solid',
                    borderColor: isActive ? categoryColor : theme.palette.divider,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease-in-out',
                    minWidth: '130px',
                    '&:hover': {
                      backgroundColor:
                        theme.palette.mode === 'dark' ? `${categoryColor}30` : `${categoryColor}15`,
                      borderColor: categoryColor,
                      transform: 'translateY(-1px)',
                      boxShadow: `0 2px 6px ${categoryColor}30`
                    },
                    '&:active': {
                      transform: 'translateY(0)'
                    }
                  }}
                >
                  <Box
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      backgroundColor: categoryColor,
                      opacity: isActive ? 1 : 0.5,
                      transition: 'opacity 0.15s'
                    }}
                  />
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: isActive ? 700 : 600,
                      fontSize: '0.8125rem',
                      color: isActive ? categoryColor : theme.palette.text.secondary,
                      flex: 1,
                      textAlign: 'left',
                      transition: 'color 0.15s'
                    }}
                  >
                    {getCategory(category)}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </Box>
      </TableCell>
    </TableRow>
  );
};
