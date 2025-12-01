import { GraphQLFieldResolver } from 'graphql';
import db from '../../../database';
import { buildRubricResult, RubricGraphQL } from './rubric';

export interface CategorizedRubricsGraphQL {
  innovationProject: RubricGraphQL | null;
  robotDesign: RubricGraphQL | null;
  coreValues: RubricGraphQL | null;
}

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
  try {
    // If there's no team assigned to this session, return empty rubrics
    if (!session.teamId) {
      return {
        innovationProject: null,
        robotDesign: null,
        coreValues: null
      };
    }

    // Fetch all rubrics for this team in this division
    const rubrics = await db.rubrics
      .byDivision(session.divisionId)
      .byTeamId(session.teamId)
      .getAll();

    // Create a map of category to rubric
    const rubricMap = new Map(rubrics.map(r => [r.category, buildRubricResult(r)]));

    return {
      innovationProject: rubricMap.get('innovation-project') || null,
      robotDesign: rubricMap.get('robot-design') || null,
      coreValues: rubricMap.get('core-values') || null
    };
  } catch (error) {
    console.error('Error fetching rubrics for session:', session, error);
    throw error;
  }
};
