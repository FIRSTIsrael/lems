'use client';

import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import { Box, Chip, Stack, Typography } from '@mui/material';
import { useJudgingCategoryTranslations } from '@lems/localization';
import { JudgingCategory } from '@lems/types/judging';

interface CategoryFilterProps {
  currentCategory?: JudgingCategory;
  compact?: boolean;
}

const CATEGORIES: JudgingCategory[] = ['innovation-project', 'robot-design', 'core-values'];

export function CategoryFilter({ currentCategory, compact = false }: CategoryFilterProps) {
  const tCompare = useTranslations('layouts.deliberation.compare');
  const { getCategory } = useJudgingCategoryTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleCategoryChange = (category?: JudgingCategory) => {
    const params = new URLSearchParams(searchParams.toString());

    if (category) {
      params.set('category', category);
    } else {
      params.delete('category');
    }

    router.push(`?${params.toString()}`);
  };

  if (compact) {
    return (
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap alignItems="center">
        <Chip
          label={tCompare('all-categories')}
          variant={!currentCategory ? 'filled' : 'outlined'}
          color={!currentCategory ? 'primary' : 'default'}
          onClick={() => handleCategoryChange()}
          clickable
          size="medium"
          sx={{ fontSize: '0.9rem', height: 36 }}
        />
        {CATEGORIES.map(category => (
          <Chip
            key={category}
            label={getCategory(category)}
            variant={currentCategory === category ? 'filled' : 'outlined'}
            color={currentCategory === category ? 'primary' : 'default'}
            onClick={() => handleCategoryChange(category)}
            clickable
            size="medium"
            sx={{ fontSize: '0.9rem', height: 36 }}
          />
        ))}
      </Stack>
    );
  }

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
        {tCompare('filter-by-category')}
      </Typography>
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        <Chip
          label={tCompare('all-categories')}
          variant={!currentCategory ? 'filled' : 'outlined'}
          color={!currentCategory ? 'primary' : 'default'}
          onClick={() => handleCategoryChange()}
          clickable
        />
        {CATEGORIES.map(category => (
          <Chip
            key={category}
            label={getCategory(category)}
            variant={currentCategory === category ? 'filled' : 'outlined'}
            color={currentCategory === category ? 'primary' : 'default'}
            onClick={() => handleCategoryChange(category)}
            clickable
          />
        ))}
      </Stack>
    </Box>
  );
}
