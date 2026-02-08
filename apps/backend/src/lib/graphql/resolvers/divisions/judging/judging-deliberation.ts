import { GraphQLFieldResolver } from 'graphql';
import type { JudgingCategory, DeliberationStatus } from '@lems/database';
import { MutationError, MutationErrorCode } from '@lems/types/api/lems';
import { underscoresToHyphens, hyphensToUnderscores } from '@lems/shared/utils';
import db from '../../../../database';
import type { GraphQLContext } from '../../../apollo-server';

export interface JudgingDeliberationGraphQL {
  id: string;
  category: JudgingCategory;
  status: DeliberationStatus;
  startTime: string | null;
  picklist: string[];
}

interface JudgingWithDivisionId {
  divisionId: string;
}

interface DeliberationArgs {
  category: JudgingCategory;
}

/**
 * Resolver for Judging.deliberation(category) field.
 * Fetches a specific category deliberation for a division.
 * Requires authentication - deliberation data is sensitive.
 */
export const judgingDeliberationResolver: GraphQLFieldResolver<
  JudgingWithDivisionId,
  GraphQLContext,
  DeliberationArgs,
  Promise<JudgingDeliberationGraphQL | null>
> = async (judging: JudgingWithDivisionId, args: DeliberationArgs, context: GraphQLContext) => {
  if (!context.user) {
    throw new MutationError(MutationErrorCode.UNAUTHORIZED, 'Authentication required');
  }

  try {
    const category = underscoresToHyphens(args.category);

    const deliberation = await db.judgingDeliberations
      .byDivision(judging.divisionId)
      .getByCategory(category);

    if (!deliberation) {
      return null;
    }

    return {
      id: deliberation.id,
      category: hyphensToUnderscores(deliberation.category) as JudgingCategory,
      status: deliberation.status,
      startTime: deliberation.start_time ? deliberation.start_time.toISOString() : null,
      picklist: deliberation.picklist
    };
  } catch (error) {
    console.error(
      `Error fetching deliberation for division ${judging.divisionId} category ${args.category}:`,
      error
    );
    throw error;
  }
};
