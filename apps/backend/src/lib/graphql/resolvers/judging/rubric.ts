import { GraphQLFieldResolver } from 'graphql';
import { Rubric as DbRubric } from '@lems/database';
import { hyphensToUnderscores } from '@lems/shared/utils';
import { toGraphQLId } from '../../utils/object-id-transformer';

export interface RubricGraphQL {
  _id?: string; // Optional MongoDB ObjectId or string
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
 * Main resolver object for Rubric type fields.
 * Handles id, category, and status field transformations.
 */
export const rubricResolvers = {
  id: ((rubric: RubricGraphQL) => {
    if (!rubric._id) {
      throw new Error('Rubric ID is missing');
    }
    return toGraphQLId(rubric._id);
  }) as GraphQLFieldResolver<RubricGraphQL, unknown, unknown, string>,

  category: ((rubric: RubricGraphQL) => {
    // Convert from 'innovation-project' to 'innovation_project' format for GraphQL
    return hyphensToUnderscores(rubric.category);
  }) as GraphQLFieldResolver<RubricGraphQL, unknown, unknown, string>,

  status: ((rubric: RubricGraphQL) => {
    // Return status as-is (already in lowercase format)
    return rubric.status;
  }) as GraphQLFieldResolver<RubricGraphQL, unknown, unknown, string>
};

/**
 * Helper function to build a RubricGraphQL object from a database rubric.
 */
export function buildRubricResult(rubric: DbRubric): RubricGraphQL {
  return {
    _id: rubric._id,
    divisionId: rubric.divisionId,
    teamId: rubric.teamId,
    category: rubric.category,
    status: rubric.status,
    data: rubric.data
  };
}
