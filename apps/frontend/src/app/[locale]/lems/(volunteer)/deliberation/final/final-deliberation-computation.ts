import { CategorizedRubrics } from '../types';
import { OptionalAwardNominations } from './types';

/**
 * Extracts optional award nominations from a rubric
 */
function extractOptionalAwards(rubrics: CategorizedRubrics): OptionalAwardNominations {
  const nominations: OptionalAwardNominations = {};

  if (!rubrics) return nominations;

  const categories: (keyof typeof rubrics)[] = [
    'innovation_project',
    'robot_design',
    'core_values'
  ];

  categories.forEach(category => {
    const rubric = rubrics[category];
    if (rubric?.data?.awards) {
      Object.entries(rubric.data.awards).forEach(([awardName, hasNomination]) => {
        if (hasNomination) {
          nominations[awardName as keyof OptionalAwardNominations] = true;
        }
      });
    }
  });

  return nominations;
}
