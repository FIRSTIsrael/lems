import { GraphQLFieldResolver } from 'graphql';
import type { JudgingCategory, DeliberationStatus } from '@lems/database';
import { underscoresToHyphens, hyphensToUnderscores } from '@lems/shared/utils';
import db from '../../../../database';

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
 */
export const judgingDeliberationResolver: GraphQLFieldResolver<
  JudgingWithDivisionId,
  unknown,
  DeliberationArgs,
  Promise<JudgingDeliberationGraphQL | null>
> = async (judging: JudgingWithDivisionId, args: DeliberationArgs) => {
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
