'use client';

import Link from 'next/link';
import { Button } from '@mui/material';
import { useJudgingCategoryTranslations } from '@lems/localization';
import type { Team } from '../../graphql/types';

type JudgingCategory = 'innovation-project' | 'robot-design' | 'core-values';

interface RubricButtonProps {
  team: Team;
  category: JudgingCategory;
  fontSize?: string;
}

export const RubricButton: React.FC<RubricButtonProps> = ({
  team,
  category,
  fontSize = '0.75rem'
}) => {
  const { getCategory } = useJudgingCategoryTranslations();

  return (
    <Button
      component={Link}
      href={`/lems/team/${team.slug}/rubric/${category}`}
      target="_blank"
      variant="text"
      size="small"
      sx={{
        fontSize,
        fontWeight: 600,
        cursor: 'pointer',
        p: 0,
        minWidth: 'auto'
      }}
    >
      {getCategory(category)}
    </Button>
  );
};
