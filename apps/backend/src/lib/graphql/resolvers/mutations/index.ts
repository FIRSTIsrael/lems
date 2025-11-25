import { teamArrivedResolver } from './teams';
import { abortJudgingSessionResolver, startJudgingSessionResolver } from './judging-sessions';

export const mutationResolvers = {
  teamArrived: teamArrivedResolver,
  startJudgingSession: startJudgingSessionResolver,
  abortJudgingSession: abortJudgingSessionResolver
};
