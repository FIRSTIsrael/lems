import { WithId } from 'mongodb';
import { Scoresheet, RobotGameMatch } from '@lems/types';

export const getEventScoresheets = (matches: Array<WithId<RobotGameMatch>>): Array<Scoresheet> => {
  const scoresheets = [];

  matches.forEach(match => {
    const scoresheet: Scoresheet = {
      team: match.team,
      match: match._id,
      stage: match.type,
      round: match.round,
      status: 'empty'
    };
    scoresheets.push(scoresheet);
  });

  return scoresheets;
};
