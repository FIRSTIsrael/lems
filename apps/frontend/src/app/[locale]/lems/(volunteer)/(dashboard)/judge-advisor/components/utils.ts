import { RubricStatus } from '@lems/database';
import { JUDGING_CATEGORIES, JudgingCategory } from '@lems/types/judging';
import { JudgingSessionAdvisor } from '../judge-advisor.graphql';

export type RubricStatusStat = {
  empty: number;
  draft: number;
  locked: number;
  completed: number;
  approved: number;
  total: number;
};

export function getRubricStatusStats(
  sessions: JudgingSessionAdvisor[]
): Record<JudgingCategory, RubricStatusStat> {
  return JUDGING_CATEGORIES.reduce(
    (acc, category) => {
      const statuses = sessions
        .map(session => session.rubrics[category]?.status || ('empty' as RubricStatus))
        .filter(Boolean);

      const statusCounts = statuses.reduce(
        (counts, status) => {
          counts[status] += 1;
          return counts;
        },
        { empty: 0, draft: 0, locked: 0, completed: 0, approved: 0 }
      );

      acc[category] = {
        ...statusCounts,
        total: statuses.length
      };

      return acc;
    },
    {} as Record<JudgingCategory, RubricStatusStat>
  );
}
