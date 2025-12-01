import { teamArrivedResolver } from './teams';
import { abortJudgingSessionResolver, startJudgingSessionResolver } from './judging-sessions';
import {
  updateRubricValueResolver,
  updateRubricFeedbackResolver,
  updateRubricStatusResolver
} from './rubrics';

export const mutationResolvers = {
  teamArrived: teamArrivedResolver,
  startJudgingSession: startJudgingSessionResolver,
  abortJudgingSession: abortJudgingSessionResolver,
  updateRubricValue: updateRubricValueResolver,
  updateRubricFeedback: updateRubricFeedbackResolver,
  updateRubricStatus: updateRubricStatusResolver
};
