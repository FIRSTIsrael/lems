import { GraphQLFieldResolver } from 'graphql';
import { Rubric as DbRubric } from '@lems/database';

export interface RubricGraphQL {
  divisionId: string;
  teamId: string;
  category: string;
  status: string;
  data?: {
    awards?: Record<string, boolean>;
    values: Record<string, { value: number; notes?: string }>;
    feedback: { greatJob: string; thinkAbout: string };
  };
}

/**
 * Resolver for Rubric.team field.
 * Fetches the team being evaluated in this rubric.
 */
export const rubricTeamResolver: GraphQLFieldResolver<
  RubricGraphQL,
  unknown,
  unknown,
  Promise<{ id: string }>
> = async (rubric: RubricGraphQL) => {
  return { id: rubric.teamId };
};

/**
 * Resolver for Rubric.category field.
 * Converts the database category format to GraphQL enum format.
 */
export const rubricCategoryResolver: GraphQLFieldResolver<
  RubricGraphQL,
  unknown,
  unknown,
  string
> = (rubric: RubricGraphQL) => {
  // Convert from 'innovation-project' to 'INNOVATION_PROJECT' format
  return rubric.category.replace(/-/g, '_').toUpperCase();
};

/**
 * Resolver for Rubric.status field.
 * Converts the database status format to GraphQL enum format.
 */
export const rubricStatusResolver: GraphQLFieldResolver<RubricGraphQL, unknown, unknown, string> = (
  rubric: RubricGraphQL
) => {
  // Convert from 'in-progress' to 'IN_PROGRESS' format
  return rubric.status.replace(/-/g, '_').toUpperCase();
};

/**
 * Resolver for Rubric.data field.
 * Returns the rubric data if it exists.
 */
export const rubricDataResolver: GraphQLFieldResolver<
  RubricGraphQL,
  unknown,
  unknown,
  RubricGraphQL['data'] | null
> = (rubric: RubricGraphQL) => {
  return rubric.data || null;
};

/**
 * Helper function to build a RubricGraphQL object from a database rubric.
 */
export function buildRubricResult(rubric: DbRubric): RubricGraphQL {
  return {
    divisionId: rubric.divisionId,
    teamId: rubric.teamId,
    category: rubric.category,
    status: rubric.status,
    data: rubric.data
  };
}
