import { GraphQLFieldResolver } from 'graphql';
import { Scoresheet } from '@lems/database';
import db from '../../../database';
import { buildScoresheetResult, ScoresheetGraphQL } from '../../utils/scoresheet-builder';

interface TeamWithDivisionId {
  id: string;
  divisionId: string;
}

interface ScoresheetsArgs {
  stage?: 'PRACTICE' | 'RANKING';
}

/**
 * Resolver for Team.scoresheets field.
 * Fetches scoresheets for this team, optionally filtered by stage.
 */
export const teamScoresheetsResolver: GraphQLFieldResolver<
  TeamWithDivisionId,
  unknown,
  ScoresheetsArgs,
  Promise<ScoresheetGraphQL[]>
> = async (team: TeamWithDivisionId, args: ScoresheetsArgs) => {
  try {
    // Get all scoresheets for this team in the division
    let scoresheets = await db.raw.mongo
      .collection<Scoresheet>('scoresheets')
      .find({
        divisionId: team.divisionId,
        teamId: team.id
      })
      .toArray();

    // Filter by stage if provided
    if (args.stage) {
      scoresheets = scoresheets.filter(s => s.stage === args.stage);
    }

    return scoresheets.map(s => buildScoresheetResult(s));
  } catch (error) {
    console.error('Error fetching scoresheets for team:', team.id, error);
    throw error;
  }
};
