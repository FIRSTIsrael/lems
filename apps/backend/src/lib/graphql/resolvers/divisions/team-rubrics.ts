import { GraphQLFieldResolver } from 'graphql';
import { buildCategorizedRubrics, CategorizedRubricsGraphQL } from '../../utils/rubric-builder';

interface TeamWithDivisionId {
  id: string;
  divisionId: string;
}

/**
 * Resolver for Team.rubrics field (when accessed via division).
 * Fetches all rubrics for this team, organized by category.
 */
export const teamRubricsResolver: GraphQLFieldResolver<
  TeamWithDivisionId,
  unknown,
  unknown,
  Promise<CategorizedRubricsGraphQL>
> = async (team: TeamWithDivisionId) => {
  return buildCategorizedRubrics(team.divisionId, team.id);
};
