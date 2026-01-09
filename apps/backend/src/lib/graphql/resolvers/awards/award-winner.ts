import { GraphQLFieldResolver } from 'graphql';
import db from '../../../database';
import { buildTeamGraphQL, TeamGraphQL } from '../../utils/team-builder';
import type { GraphQLContext } from '../../apollo-server';
import { requireAuthDivisionAndRole, requireAuthAndDivisionAccess } from '../../utils/auth-helpers';

// TODO: Replace with actual value from division/event settings
const AWARDS_ANNOUNCED = false;

// Allowed roles before awards are announced
const PRE_ANNOUNCEMENT_ROLES = ['judge-advisor'];

export interface AwardGraphQL {
  id: string;
  divisionId?: string;
  name: string;
  index: number;
  place: number;
  type: string;
  isOptional: boolean;
  allowNominations: boolean;
  automaticAssignment: boolean;
  description?: string;
}

export interface AwardWinnerGraphQL {
  teamId: string;
  divisionId: string; // Added to track division
}

/**
 * Resolver for Award.winner field.
 * Returns the computed winner for an award.
 *
 * Permission rules:
 * - Before awards are announced: Requires judge-advisor role
 * - After awards are announced: Accessible to anyone with division access
 *
 * @throws GraphQLError if user doesn't have appropriate permissions
 */
export const awardWinnerResolver: GraphQLFieldResolver<
  AwardGraphQL,
  GraphQLContext,
  unknown,
  Promise<AwardWinnerGraphQL | null>
> = async (award: AwardGraphQL, _args: unknown, context: GraphQLContext) => {
  if (!award.divisionId) {
    throw new Error('Award must have divisionId to resolve winner');
  }

  // If awards haven't been announced yet, require judge-advisor role
  if (!AWARDS_ANNOUNCED) {
    requireAuthDivisionAndRole(context.user, award.divisionId, PRE_ANNOUNCEMENT_ROLES);
  } else {
    // After announcement, only require basic division access
    requireAuthAndDivisionAccess(context.user, award.divisionId);
  }

  try {
    // TODO: Implement actual database query for award winners
    // For now, return null as award winners aren't implemented yet
    // When implemented, query should look like:
    // const awardWinner = await db.awardWinners.byAwardId(award.id).get();

    // Placeholder return
    return null;
  } catch (error) {
    console.error('Error fetching award winner:', error);
    throw error;
  }
};

/**
 * Resolver for AwardWinner.team field.
 * Fetches the team that won the award.
 */
export const awardWinnerTeamResolver: GraphQLFieldResolver<
  AwardWinnerGraphQL,
  unknown,
  unknown,
  Promise<TeamGraphQL>
> = async (awardWinner: AwardWinnerGraphQL) => {
  try {
    const team = await db.teams.byId(awardWinner.teamId).get();

    if (!team) {
      throw new Error(`Team not found: ${awardWinner.teamId}`);
    }

    // Use the divisionId from the awardWinner object
    return buildTeamGraphQL(team, awardWinner.divisionId);
  } catch (error) {
    console.error('Error fetching team for award winner:', error);
    throw error;
  }
};
