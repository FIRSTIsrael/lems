import { GraphQLFieldResolver } from 'graphql';
import { Scoresheet } from '@lems/database';
import db from '../../../../database';
import {
  buildScoresheetResult,
  ScoresheetGraphQL,
  generateScoresheetSlug
} from '../../../utils/scoresheet-builder';

interface FieldWithDivisionId {
  divisionId: string;
}

interface ScoresheetsArgs {
  ids?: string[];
  teamIds?: string[];
  slug?: string;
  stage?: 'PRACTICE' | 'RANKING';
  round?: number;
}

/**
 * Resolver for Field.scoresheets field.
 * Fetches scoresheets for teams in a division, optionally filtered by various criteria.
 */
export const fieldScoresheetsResolver: GraphQLFieldResolver<
  FieldWithDivisionId,
  unknown,
  ScoresheetsArgs,
  Promise<ScoresheetGraphQL[]>
> = async (field: FieldWithDivisionId, args: ScoresheetsArgs) => {
  try {
    // Get all scoresheets for the division
    const scoresheets = await db.raw.mongo
      .collection('scoresheets')
      .find({ divisionId: field.divisionId })
      .toArray();

    let filteredScoresheets = scoresheets;

    // Filter by IDs if provided
    if (args.ids && args.ids.length > 0) {
      const idsSet = new Set(args.ids);
      filteredScoresheets = filteredScoresheets.filter(s => idsSet.has(s._id?.toString() || ''));
    }

    // Filter by team IDs if provided
    if (args.teamIds && args.teamIds.length > 0) {
      const teamIdsSet = new Set(args.teamIds);
      filteredScoresheets = filteredScoresheets.filter(s => teamIdsSet.has(s.teamId));
    }

    // Filter by slug if provided
    if (args.slug) {
      filteredScoresheets = filteredScoresheets.filter(s => {
        const scoresheetSlug = generateScoresheetSlug(s.stage as 'PRACTICE' | 'RANKING', s.round);
        return scoresheetSlug === args.slug;
      });
    }

    // Filter by stage if provided
    if (args.stage) {
      filteredScoresheets = filteredScoresheets.filter(s => s.stage === args.stage);
    }

    // Filter by round if provided
    if (args.round !== undefined) {
      filteredScoresheets = filteredScoresheets.filter(s => s.round === args.round);
    }

    return filteredScoresheets.map(s => buildScoresheetResult(s as unknown as Scoresheet));
  } catch (error) {
    console.error('Error fetching scoresheets for division:', field.divisionId, error);
    throw error;
  }
};
