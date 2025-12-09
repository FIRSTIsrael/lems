import { GraphQLFieldResolver } from 'graphql';
import db from '../../../database';
import { buildTeamGraphQL, TeamGraphQL } from '../../utils/team-builder';
import { ScoresheetGraphQL } from '../../utils/scoresheet-builder';

/**
 * Resolver for Scoresheet.team field.
 * Fetches the team being evaluated in this scoresheet.
 */
export const scoresheetTeamResolver: GraphQLFieldResolver<
  ScoresheetGraphQL,
  unknown,
  unknown,
  Promise<TeamGraphQL>
> = async (scoresheet: ScoresheetGraphQL) => {
  const team = await db.teams.byId(scoresheet.teamId).get();
  if (!team) {
    throw new Error(`Team not found: ${scoresheet.teamId}`);
  }
  return buildTeamGraphQL(team, scoresheet.divisionId);
};

/**
 * Resolver for Scoresheet.data field.
 * Returns the scoresheet data if it exists.
 */
export const scoresheetDataResolver: GraphQLFieldResolver<
  ScoresheetGraphQL,
  unknown,
  unknown,
  ScoresheetGraphQL['data'] | null
> = (scoresheet: ScoresheetGraphQL) => {
  return scoresheet.data || null;
};

/**
 * Main resolver object for Scoresheet type fields.
 * Handles id, slug, status, and stage field transformations.
 */
export const scoresheetResolvers = {
  id: ((scoresheet: ScoresheetGraphQL) => {
    if (!scoresheet.id) {
      throw new Error('Scoresheet ID is missing');
    }
    return scoresheet.id;
  }) as GraphQLFieldResolver<ScoresheetGraphQL, unknown, unknown, string>,

  slug: ((scoresheet: ScoresheetGraphQL) => {
    // Return the pre-computed slug
    return scoresheet.slug;
  }) as GraphQLFieldResolver<ScoresheetGraphQL, unknown, unknown, string>,

  status: ((scoresheet: ScoresheetGraphQL) => {
    // Return status as-is (already in lowercase format)
    return scoresheet.status;
  }) as GraphQLFieldResolver<ScoresheetGraphQL, unknown, unknown, string>,

  stage: ((scoresheet: ScoresheetGraphQL) => {
    // Return stage as-is (PRACTICE or RANKING)
    return scoresheet.stage;
  }) as GraphQLFieldResolver<ScoresheetGraphQL, unknown, unknown, string>
};
