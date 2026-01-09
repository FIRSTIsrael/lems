import { RubricStatus } from '@lems/database';
import type { JudgingCategory } from '@lems/types/judging';
import { hyphensToUnderscores } from '@lems/shared/utils';
import { MAX_PICKLIST_LIMIT, PICKLIST_LIMIT_MULTIPLIER } from '@lems/shared';
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

  const arrivedSessions = sessions.filter(session => session.team.arrived);

  const statuses = arrivedSessions
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

/**
 * Calculates the desired picklist length based on the number of judging sessions.
 *
 * @param sessionCount - The number of judging sessions
 * @returns The desired picklist length
 */
export function getDesiredPicklistLength(sessionCount: number): number {
  return Math.min(MAX_PICKLIST_LIMIT, Math.ceil(sessionCount * PICKLIST_LIMIT_MULTIPLIER));
}
