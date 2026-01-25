import { GraphQLFieldResolver } from 'graphql';
import db from '../../../database';
import { buildTeamGraphQL, TeamGraphQL } from '../../utils/team-builder';
import { toGraphQLId } from '../../utils/object-id-transformer';
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
 * Resolver for Scoresheet.table field.
 * Fetches the table where the match for this scoresheet was played.
 * This resolver only executes when the table field is explicitly requested.
 */
export const scoresheetTableResolver: GraphQLFieldResolver<
  ScoresheetGraphQL,
  unknown,
  unknown,
  Promise<{ id: string; name: string } | null>
> = async (scoresheet: ScoresheetGraphQL) => {
  try {
    // Find the match that corresponds to this scoresheet
    const matches = await db.robotGameMatches.byDivision(scoresheet.divisionId).getAll();

    // Find the match for this scoresheet's stage, round, and team
    const match = matches.find(
      m =>
        m.stage === scoresheet.stage &&
        m.round === scoresheet.round &&
        m.participants.some(p => p.team_id === scoresheet.teamId)
    );

    if (!match) {
      // No match found for this scoresheet (which can happen for some edge cases)
      return null;
    }

    // Find the table for this team in the match
    const participant = match.participants.find(p => p.team_id === scoresheet.teamId);

    if (!participant) {
      return null;
    }

    // Get the table information
    const table = await db.tables.byId(participant.table_id).get();

    if (!table) {
      throw new Error(`Table not found: ${participant.table_id}`);
    }

    return {
      id: table.id,
      name: table.name
    };
  } catch (error) {
    console.error('Error fetching table for scoresheet:', scoresheet.id, error);
    throw error;
  }
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
    return toGraphQLId(scoresheet.id);
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
