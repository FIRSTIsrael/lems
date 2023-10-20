import { WithId } from 'mongodb';
import { JudgingCategoryTypes, Rubric, JudgingCategory, Team } from '@lems/types';

export const getEventRubrics = (teams: Array<WithId<Team>>): Rubric<JudgingCategory>[] => {
  const rubrics = [];

  teams.forEach(team => {
    JudgingCategoryTypes.forEach(category => {
      const rubric: Rubric<JudgingCategory> = {
        team: team._id,
        category: category,
        status: 'empty'
      };

      rubrics.push(rubric);
    });
  });

  return rubrics;
};
