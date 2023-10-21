import { WithId } from 'mongodb';
import { JudgingCategoryTypes, Rubric, JudgingCategory, Team, Event } from '@lems/types';

export const getEventRubrics = (
  event: WithId<Event>,
  teams: Array<WithId<Team>>
): Rubric<JudgingCategory>[] => {
  const rubrics = [];

  teams.forEach(team => {
    JudgingCategoryTypes.forEach(category => {
      const rubric: Rubric<JudgingCategory> = {
        eventId: event._id,
        teamId: team._id,
        category: category,
        status: 'empty'
      };

      rubrics.push(rubric);
    });
  });

  return rubrics;
};
