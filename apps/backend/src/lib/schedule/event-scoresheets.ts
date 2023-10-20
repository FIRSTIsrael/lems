import { WithId } from 'mongodb';
import { Scoresheet, RobotGameMatch } from '@lems/types';

export const getEventScoresheets = (matches: Array<WithId<RobotGameMatch>>): Array<Scoresheet> =>
  matches.flatMap(match =>
    match.participants
      .filter(p => p.teamId)
      .map(participant => ({
        eventId: match.eventId,
        matchId: match._id,
        teamId: participant.teamId,
        stage: match.stage,
        round: match.round,
        status: 'empty'
      }))
  );
