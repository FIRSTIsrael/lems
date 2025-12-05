import { teamArrivedResolver } from './team-arrived';
import { abortJudgingSessionResolver, startJudgingSessionResolver } from './judging-sessions/index';
import { loadMatchResolver } from './matches/index';
import {
  updateRubricValueResolver,
  updateRubricFeedbackResolver,
  updateRubricStatusResolver,
  updateRubricAwardsResolver
} from './rubrics';

export const mutationResolvers = {
  teamArrived: teamArrivedResolver,
  startJudgingSession: startJudgingSessionResolver,
  abortJudgingSession: abortJudgingSessionResolver,
  loadMatch: loadMatchResolver,
  updateRubricValue: updateRubricValueResolver,
  updateRubricFeedback: updateRubricFeedbackResolver,
  updateRubricStatus: updateRubricStatusResolver,
  updateRubricAwards: updateRubricAwardsResolver
};
