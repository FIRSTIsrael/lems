import { teamArrivedResolver } from './team-arrived';
import { abortJudgingSessionResolver, startJudgingSessionResolver } from './judging-sessions/index';
import { loadMatchResolver, startMatchResolver, abortMatchResolver } from './matches/index';
import {
  updateRubricValueResolver,
  updateRubricFeedbackResolver,
  updateRubricStatusResolver,
  updateRubricAwardsResolver,
  resetRubricResolver
} from './rubrics';
import {
  updateScoresheetMissionClauseResolver,
  updateScoresheetGPResolver,
  updateScoresheetStatusResolver,
  updateScoresheetEscalatedResolver,
  updateScoresheetSignatureResolver
} from './scoresheets';
import {
  switchActiveDisplayResolver,
  updateAudienceDisplaySettingResolver
} from './audience-display';
import {
  startDeliberationResolver,
  updateDeliberationPicklistResolver,
  startFinalDeliberationResolver,
  advanceFinalDeliberationStageResolver,
  updateFinalDeliberationAwardsResolver,
  updateManualEligibilityResolver,
  completeFinalDeliberationResolver
} from './deliberations';

export const mutationResolvers = {
  teamArrived: teamArrivedResolver,
  startJudgingSession: startJudgingSessionResolver,
  abortJudgingSession: abortJudgingSessionResolver,
  loadMatch: loadMatchResolver,
  startMatch: startMatchResolver,
  abortMatch: abortMatchResolver,
  switchActiveDisplay: switchActiveDisplayResolver,
  updateAudienceDisplaySetting: updateAudienceDisplaySettingResolver,
  updateRubricValue: updateRubricValueResolver,
  updateRubricFeedback: updateRubricFeedbackResolver,
  updateRubricStatus: updateRubricStatusResolver,
  updateRubricAwards: updateRubricAwardsResolver,
  resetRubric: resetRubricResolver,
  updateScoresheetMissionClause: updateScoresheetMissionClauseResolver,
  updateScoresheetGP: updateScoresheetGPResolver,
  updateScoresheetEscalated: updateScoresheetEscalatedResolver,
  updateScoresheetSignature: updateScoresheetSignatureResolver,
  updateScoresheetStatus: updateScoresheetStatusResolver,
  startDeliberation: startDeliberationResolver,
  updateDeliberationPicklist: updateDeliberationPicklistResolver,
  startFinalDeliberation: startFinalDeliberationResolver,
  advanceFinalDeliberationStage: advanceFinalDeliberationStageResolver,
  updateFinalDeliberationAwards: updateFinalDeliberationAwardsResolver,
  updateManualEligibility: updateManualEligibilityResolver,
  completeFinalDeliberation: completeFinalDeliberationResolver
};
