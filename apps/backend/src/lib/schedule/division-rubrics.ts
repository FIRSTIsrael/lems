import { WithId } from 'mongodb';
import { JudgingCategoryTypes, Rubric, JudgingCategory, Team, Division } from '@lems/types';

export const getDivisionRubrics = (
  division: WithId<Division>,
  teams: Array<WithId<Team>>
): Rubric<JudgingCategory>[] => {
  const rubrics = [];

  teams.forEach(team => {
    JudgingCategoryTypes.forEach(category => {
      const rubric: Rubric<JudgingCategory> = {
        divisionId: division._id,
        teamId: team._id,
        category: category,
        status: 'empty'
      };

      rubrics.push(rubric);
    });
  });

  return rubrics;
};
