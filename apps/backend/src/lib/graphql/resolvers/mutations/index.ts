import { teamArrivedResolver } from './team-arrived';
import { abortJudgingSessionResolver, startJudgingSessionResolver } from './judging-sessions/index';
import { loadMatchResolver, startMatchResolver, abortMatchResolver } from './matches/index';
import {
  updateRubricValueResolver,
  updateRubricFeedbackResolver,
  updateRubricStatusResolver,
  updateRubricAwardsResolver
} from './rubrics';
import { updateScoresheetMissionClauseResolver } from './scoresheets';
import { switchActiveDisplayResolver } from './audience-display';

export const mutationResolvers = {
  teamArrived: teamArrivedResolver,
  startJudgingSession: startJudgingSessionResolver,
  abortJudgingSession: abortJudgingSessionResolver,
  loadMatch: loadMatchResolver,
  startMatch: startMatchResolver,
  abortMatch: abortMatchResolver,
  switchActiveDisplay: switchActiveDisplayResolver,
  updateRubricValue: updateRubricValueResolver,
  updateRubricFeedback: updateRubricFeedbackResolver,
  updateRubricStatus: updateRubricStatusResolver,
  updateRubricAwards: updateRubricAwardsResolver,
  updateScoresheetMissionClause: updateScoresheetMissionClauseResolver
};
