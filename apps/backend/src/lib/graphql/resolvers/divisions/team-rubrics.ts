import { GraphQLFieldResolver } from 'graphql';
import { MutationError, MutationErrorCode } from '@lems/types/api/lems';
import { buildCategorizedRubrics, CategorizedRubricsGraphQL } from '../../utils/rubric-builder';
import type { GraphQLContext } from '../../apollo-server';

interface TeamWithDivisionId {
  id: string;
  divisionId: string;
}

/**
 * Resolver for Team.rubrics field (when accessed via division).
 * Fetches all rubrics for this team, organized by category.
 * Requires authentication - rubric data is sensitive.
 */
export const teamRubricsResolver: GraphQLFieldResolver<
  TeamWithDivisionId,
  GraphQLContext,
  unknown,
  Promise<CategorizedRubricsGraphQL>
> = async (team: TeamWithDivisionId, _args, context: GraphQLContext) => {
  if (!context.user) {
    throw new MutationError(MutationErrorCode.UNAUTHORIZED, 'Authentication required');
  }

  return buildCategorizedRubrics(team.divisionId, team.id);
};
