import { GraphQLFieldResolver } from 'graphql';
import type { GraphQLContext } from '../../../apollo-server';
import db from '../../../../database';

interface JudgingGraphQL {
  divisionId: string;
}

interface FinalDeliberationGraphQL {
  divisionId: string;
  stage: string;
  status: string;
  startTime: string | null;
  completionTime: string | null;
  champions: string; // JSON string of Record<number, string>
  innovationProject: string[];
  robotDesign: string[];
  coreValues: string[];
  robotPerformance: string[];
  optionalAwards: string;
  coreAwardsManualEligibility: string[];
  optionalAwardsManualEligibility: string[];
}

/**
 * Resolver for Judging.finalDeliberation
 * Returns the final deliberation for a division
 */
export const judgingFinalDeliberationResolver: GraphQLFieldResolver<
  JudgingGraphQL,
  GraphQLContext,
  unknown,
  Promise<FinalDeliberationGraphQL | null>
> = async parent => {
  const deliberation = await db.finalDeliberations.byDivision(parent.divisionId).get();

  if (!deliberation) {
    return null;
  }

  return {
    divisionId: deliberation.divisionId,
    stage: deliberation.stage,
    status: deliberation.status,
    startTime: deliberation.startTime ? new Date(deliberation.startTime).toISOString() : null,
    completionTime: deliberation.completionTime
      ? new Date(deliberation.completionTime).toISOString()
      : null,
    champions: JSON.stringify(deliberation.awards.champions || {}),
    innovationProject: deliberation.awards['innovation-project'] || [],
    robotDesign: deliberation.awards['robot-design'] || [],
    coreValues: deliberation.awards['core-values'] || [],
    robotPerformance: deliberation.awards['robot-performance'] || [],
    optionalAwards: JSON.stringify(deliberation.awards.optionalAwards || {}),
    coreAwardsManualEligibility: deliberation.stageData?.['core-awards']?.manualEligibility || [],
    optionalAwardsManualEligibility:
      deliberation.stageData?.['optional-awards']?.manualEligibility || []
  };
};
