import { RubricStatus } from '@lems/database';
import type { JudgingCategory } from '@lems/types/judging';
import { hyphensToUnderscores } from '@lems/shared/utils';
import { JudgingSession } from '../graphql';

export type RubricStatusStat = {
  empty: number;
  draft: number;
  locked: number;
  completed: number;
  approved: number;
  total: number;
};

export function getRubricStatusStats(
  sessions: JudgingSession[],
  category: JudgingCategory
): RubricStatusStat {
  const statuses = sessions
    .map(
      session =>
        session.rubrics[hyphensToUnderscores(category)]?.status || ('empty' as RubricStatus)
    )
    .filter(Boolean);

  return statuses.reduce(
    (counts, status) => {
      counts[status] += 1;
      return counts;
    },
    { empty: 0, draft: 0, locked: 0, completed: 0, approved: 0, total: statuses.length }
  );
}
