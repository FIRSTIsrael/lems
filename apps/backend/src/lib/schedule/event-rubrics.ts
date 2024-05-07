import { WithId } from 'mongodb';
import { JudgingCategoryTypes, Rubric, JudgingCategory, Team, Event } from '@lems/types';

export const getEventRubrics = (
  division: WithId<Event>,
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
