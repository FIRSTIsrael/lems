import { WithId } from 'mongodb';
import { Team, Scoresheet } from '@lems/types';

export const getEventScoresheets = (
  teams: Array<WithId<Team>>,
  rounds: { practice: number; ranking: number }
): Array<Scoresheet> => {
  const scoresheets = [];

  teams.forEach(team => {
    for (let i = 1; i <= rounds.practice; i++) {
      const scoresheet: Scoresheet = {
        team: team._id,
        stage: 'practice',
        round: i,
        status: 'not-started'
      };

      scoresheets.push(scoresheet);
    }

    for (let i = 1; i <= rounds.ranking; i++) {
      const scoresheet: Scoresheet = {
        team: team._id,
        stage: 'ranking',
        round: i,
        status: 'not-started'
      };

      scoresheets.push(scoresheet);
    }
  });

  return scoresheets;
};
