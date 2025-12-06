import { GraphQLFieldResolver } from 'graphql';
import { buildCategorizedRubrics, CategorizedRubricsGraphQL } from '../../utils/rubric-builder';

interface SessionWithTeamAndDivision {
  teamId: string | null;
  divisionId: string;
}

/**
 * Resolver for JudgingSession.rubrics field.
 * Fetches all rubrics for the session's team, organized by category.
 */
export const sessionRubricsResolver: GraphQLFieldResolver<
  SessionWithTeamAndDivision,
  unknown,
  unknown,
  Promise<CategorizedRubricsGraphQL>
> = async (session: SessionWithTeamAndDivision) => {
  return buildCategorizedRubrics(session.divisionId, session.teamId);
};
