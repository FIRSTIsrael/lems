import { teamArrivedResolver } from './team-arrived';
import { disqualifyTeamResolver } from './disqualify-team';
import { abortJudgingSessionResolver, startJudgingSessionResolver } from './judging-sessions/index';
import {
  loadMatchResolver,
  startMatchResolver,
  abortMatchResolver,
  updateParticipantStatusResolver
} from './matches/index';
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
  updateScoresheetSignatureResolver,
  resetScoresheetResolver
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
  completeFinalDeliberationResolver,
  completeDeliberationResolver
} from './deliberations';

export const mutationResolvers = {
  teamArrived: teamArrivedResolver,
  disqualifyTeam: disqualifyTeamResolver,
  startJudgingSession: startJudgingSessionResolver,
  abortJudgingSession: abortJudgingSessionResolver,
  loadMatch: loadMatchResolver,
  startMatch: startMatchResolver,
  abortMatch: abortMatchResolver,
  updateParticipantStatus: updateParticipantStatusResolver,
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
  resetScoresheet: resetScoresheetResolver,
  startDeliberation: startDeliberationResolver,
  updateDeliberationPicklist: updateDeliberationPicklistResolver,
  completeDeliberation: completeDeliberationResolver,
  startFinalDeliberation: startFinalDeliberationResolver,
  advanceFinalDeliberationStage: advanceFinalDeliberationStageResolver,
  updateFinalDeliberationAwards: updateFinalDeliberationAwardsResolver,
  updateManualEligibility: updateManualEligibilityResolver,
  completeFinalDeliberation: completeFinalDeliberationResolver
};
