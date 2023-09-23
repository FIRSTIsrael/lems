import { WithId } from 'mongodb';
import { Scoresheet, RobotGameMatch } from '@lems/types';

export const getEventScoresheets = (matches: Array<WithId<RobotGameMatch>>): Array<Scoresheet> => {
  const scoresheets = [];

  matches.forEach(match => {
    const scoresheet: Scoresheet = {
      eventId: match.eventId,
      matchId: match._id,
      teamId: match.teamId,
      stage: match.type,
      round: match.round,
      status: 'empty'
    };
    scoresheets.push(scoresheet);
  });

  return scoresheets;
};
