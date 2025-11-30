import { GraphQLFieldResolver } from 'graphql';
import db from '../../../database';
import { buildRubricResult } from '../judging/rubric';
import { CategorizedRubricsGraphQL } from '../judging/session-rubrics';

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
  try {
    // Fetch all rubrics for this team in this division
    const rubrics = await db.rubrics.byDivision(team.divisionId).byTeamId(team.id).getAll();

    // Create a map of category to rubric
    const rubricMap = new Map(rubrics.map(r => [r.category, buildRubricResult(r)]));

    return {
      innovationProject: rubricMap.get('innovation-project') || null,
      robotDesign: rubricMap.get('robot-design') || null,
      coreValues: rubricMap.get('core-values') || null
    };
  } catch (error) {
    console.error(
      'Error fetching rubrics for team:',
      team.id,
      'in division:',
      team.divisionId,
      error
    );
    throw error;
  }
};
