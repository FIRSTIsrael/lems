import { GraphQLFieldResolver } from 'graphql';
import { hyphensToUnderscores } from '@lems/shared/utils';
import db from '../../../database';
import { toGraphQLId } from '../../utils/object-id-transformer';
import { buildTeamGraphQL, TeamGraphQL } from '../../utils/team-builder';
import { RubricGraphQL } from '../../utils/rubric-builder';

/**
 * Resolver for Rubric.team field.
 * Fetches the team being evaluated in this rubric.
 */
export const rubricTeamResolver: GraphQLFieldResolver<
  RubricGraphQL,
  unknown,
  unknown,
  Promise<TeamGraphQL>
> = async (rubric: RubricGraphQL) => {
  const team = await db.teams.byId(rubric.teamId).get();
  if (!team) {
    throw new Error(`Team not found: ${rubric.teamId}`);
  }
  return buildTeamGraphQL(team, rubric.divisionId);
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
  console.log(rubric.data);
  return rubric.data || null;
};

/**
 * Main resolver object for Rubric type fields.
 * Handles id, category, and status field transformations.
 */
export const rubricResolvers = {
  id: ((rubric: RubricGraphQL) => {
    if (!rubric.id) {
      throw new Error('Rubric ID is missing');
    }
    return toGraphQLId(rubric.id);
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
