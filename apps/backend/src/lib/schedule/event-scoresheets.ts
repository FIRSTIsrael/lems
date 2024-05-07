import { WithId } from 'mongodb';
import { Scoresheet, RobotGameMatch, Team, Event } from '@lems/types';

export const getEventScoresheets = (
  division: WithId<Event>,
  teams: Array<WithId<Team>>,
  matches: Array<WithId<RobotGameMatch>>
): Array<Scoresheet> => {
  const practiceMatches = matches.filter(m => m.stage === 'practice');
  const rankingMatches = matches.filter(m => m.stage === 'ranking');

  const practiceRounds = [...new Set(practiceMatches.flatMap(m => m.round))];
  const rankingRounds = [...new Set(rankingMatches.flatMap(m => m.round))];

  const scoresheets = [];

  teams.forEach(team => {
    practiceRounds.forEach(r => {
      const scoresheet: Scoresheet = {
        teamId: team._id,
        divisionId: division._id,
        round: r,
        stage: 'practice',
        status: 'empty'
      };

      scoresheets.push(scoresheet);
    });

    rankingRounds.forEach(r => {
      const scoresheet: Scoresheet = {
        teamId: team._id,
        divisionId: division._id,
        round: r,
        stage: 'ranking',
        status: 'empty'
      };

      scoresheets.push(scoresheet);
    });
  });

  return scoresheets;
};
