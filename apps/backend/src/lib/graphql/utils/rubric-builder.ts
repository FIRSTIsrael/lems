import { WithId } from 'mongodb';
import { Rubric as DbRubric } from '@lems/database';
import db from '../../database';

/**
 * GraphQL Rubric type for individual rubrics and categorized rubrics.
 */
export interface RubricGraphQL {
  id?: string; // MongoDB ObjectId or string
  divisionId: string;
  teamId: string;
  category: string;
  status: string;
  data?: {
    awards?: Record<string, boolean>;
    fields: Record<string, { value: 1 | 2 | 3 | 4; notes?: string }>;
    feedback?: { greatJob: string; thinkAbout: string };
  };
}

/**
 * GraphQL CategorizedRubrics type for team/session rubrics organized by category.
 */
export interface CategorizedRubricsGraphQL {
  innovationProject: RubricGraphQL | null;
  robotDesign: RubricGraphQL | null;
  coreValues: RubricGraphQL | null;
}

/**
 * Helper function to build a RubricGraphQL object from a database rubric.
 */
export function buildRubricResult(rubric: WithId<DbRubric>): RubricGraphQL {
  return {
    id: rubric._id?.toString(),
    divisionId: rubric.divisionId,
    teamId: rubric.teamId,
    category: rubric.category,
    status: rubric.status,
    data: rubric.data
  };
}

/**
 * Builds a CategorizedRubricsGraphQL object from database rubrics.
 * Fetches all rubrics for a team in a division and organizes them by category.
 * @param divisionId - The ID of the division
 * @param teamId - The ID of the team (can be null)
 * @returns Promise resolving to CategorizedRubricsGraphQL
 */
export async function buildCategorizedRubrics(
  divisionId: string,
  teamId: string | null
): Promise<CategorizedRubricsGraphQL> {
  // If there's no team, return empty rubrics
  if (!teamId) {
    return {
      innovationProject: null,
      robotDesign: null,
      coreValues: null
    };
  }

  try {
    // Fetch all rubrics for this team in this division
    const rubrics = await db.rubrics.byDivision(divisionId).byTeamId(teamId).getAll();

    // Create a map of category to rubric
    const rubricMap = new Map(rubrics.map(r => [r.category, buildRubricResult(r)]));

    return {
      innovationProject: rubricMap.get('innovation-project') || null,
      robotDesign: rubricMap.get('robot-design') || null,
      coreValues: rubricMap.get('core-values') || null
    };
  } catch (error) {
    console.error('Error fetching rubrics for team:', teamId, 'in division:', divisionId, error);
    throw error;
  }
}
