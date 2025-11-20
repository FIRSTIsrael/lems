import { teamArrivedResolver } from './teams';
import { startJudgingSessionResolver } from './judging-sessions';

export const mutationResolvers = {
  teamArrived: teamArrivedResolver,
  startJudgingSession: startJudgingSessionResolver
};
