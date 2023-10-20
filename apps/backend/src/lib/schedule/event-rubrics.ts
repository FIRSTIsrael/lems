import { WithId } from 'mongodb';
import { JudgingCategoryTypes, Rubric, JudgingCategory, JudgingSession } from '@lems/types';

export const getEventRubrics = (
  sessions: Array<WithId<JudgingSession>>
): Rubric<JudgingCategory>[] => {
  const rubrics = [];

  sessions
    .filter(s => s.team)
    .forEach(session => {
      JudgingCategoryTypes.forEach(category => {
        const rubric: Rubric<JudgingCategory> = {
          team: session.team,
          session: session._id,
          category: category,
          status: 'empty'
        };

        rubrics.push(rubric);
      });
    });

  return rubrics;
};
