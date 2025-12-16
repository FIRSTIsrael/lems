import { teamArrivedResolver } from './team-arrived';
import { abortJudgingSessionResolver, startJudgingSessionResolver } from './judging-sessions/index';
import { loadMatchResolver, startMatchResolver, abortMatchResolver } from './matches/index';
import {
  updateRubricValueResolver,
  updateRubricFeedbackResolver,
  updateRubricStatusResolver,
  updateRubricAwardsResolver
} from './rubrics';
import {
  updateScoresheetMissionClauseResolver,
  updateScoresheetSignatureResolver
} from './scoresheets';

export const mutationResolvers = {
  teamArrived: teamArrivedResolver,
  startJudgingSession: startJudgingSessionResolver,
  abortJudgingSession: abortJudgingSessionResolver,
  loadMatch: loadMatchResolver,
  startMatch: startMatchResolver,
  abortMatch: abortMatchResolver,
  updateRubricValue: updateRubricValueResolver,
  updateRubricFeedback: updateRubricFeedbackResolver,
  updateRubricStatus: updateRubricStatusResolver,
  updateRubricAwards: updateRubricAwardsResolver,
  updateScoresheetMissionClause: updateScoresheetMissionClauseResolver,
  updateScoresheetSignature: updateScoresheetSignatureResolver
};
