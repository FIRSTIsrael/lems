'use client';

import { TableRow, TableCell, Box, Typography, useTheme } from '@mui/material';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useJudgingCategoryTranslations } from '@lems/localization';
import { JudgingCategory, JUDGING_CATEGORIES } from '@lems/types/judging';
import { getRubricColor } from '@lems/shared/rubrics/rubric-utils';

export const RubricCategoryNavigation: React.FC = () => {
  const t = useTranslations('pages.rubric.navigation');
  const { getCategory } = useJudgingCategoryTranslations();

  const router = useRouter();
  const theme = useTheme();
  const { category: currentCategory, teamSlug } = useParams();

  const handleNavigate = (category: JudgingCategory) => {
    if (category !== currentCategory) {
      router.push(`/lems/team/${teamSlug}/rubric/${category}`);
    }
  };

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
            {JUDGING_CATEGORIES.map(category => {
              const isActive = category === currentCategory;
              const color = getRubricColor(category);

              return (
                <Box
                  key={category}
                  onClick={() => handleNavigate(category)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    px: 2,
                    py: 1,
                    borderRadius: 1.5,
                    backgroundColor: isActive
                      ? theme.palette.mode === 'dark'
                        ? `${color}20`
                        : `${color}10`
                      : 'transparent',
                    border: '1.5px solid',
                    borderColor: isActive ? color : theme.palette.divider,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease-in-out',
                    minWidth: '130px',
                    '&:hover': {
                      backgroundColor: theme.palette.mode === 'dark' ? `${color}30` : `${color}15`,
                      borderColor: color,
                      transform: 'translateY(-1px)',
                      boxShadow: `0 2px 6px ${color}30`
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
                      backgroundColor: color,
                      opacity: isActive ? 1 : 0.5,
                      transition: 'opacity 0.15s'
                    }}
                  />
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: isActive ? 700 : 600,
                      fontSize: '0.8125rem',
                      color: isActive ? color : theme.palette.text.secondary,
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
