import { GraphQLFieldResolver } from 'graphql';
import { JudgingCategory } from '@lems/database';
import { MutationError, MutationErrorCode } from '@lems/types/api/lems';
import db from '../../../../database';
import { buildRubricResult, RubricGraphQL } from '../../../utils/rubric-builder';
import type { GraphQLContext } from '../../../apollo-server';

interface JudgingWithDivisionId {
  divisionId: string;
}

interface RubricsArgs {
  teamIds?: string[];
  category?: string;
}

/**
 * Resolver for Judging.rubrics field.
 * Fetches rubrics for teams in a division, optionally filtered by team IDs or category.
 * Requires authentication - only judges, lead judges, and judge advisors can access rubrics.
 */
export const judgingRubricsResolver: GraphQLFieldResolver<
  JudgingWithDivisionId,
  GraphQLContext,
  RubricsArgs,
  Promise<RubricGraphQL[]>
> = async (judging: JudgingWithDivisionId, args: RubricsArgs, context: GraphQLContext) => {
  if (!context.user) {
    throw new MutationError(MutationErrorCode.UNAUTHORIZED, 'Authentication required');
  }
  try {
    let rubricsSelector = db.rubrics.byDivision(judging.divisionId);

    // Apply category filter if provided
    if (args.category) {
      // Convert GraphQL enum format to database format
      // e.g., 'innovation_project' -> 'innovation-project'
      const dbCategory = args.category.replace(/_/g, '-') as JudgingCategory;
      rubricsSelector = rubricsSelector.byCategory(dbCategory);
    }

    let rubrics = await rubricsSelector.getAll();

    // Filter by team IDs if provided
    if (args.teamIds && args.teamIds.length > 0) {
      const teamIdsSet = new Set(args.teamIds);
      rubrics = rubrics.filter(rubric => teamIdsSet.has(rubric.teamId));
    }

    return rubrics.map(buildRubricResult);
  } catch (error) {
    console.error('Error fetching rubrics for division:', judging.divisionId, error);
    throw error;
  }
};
