import { GraphQLFieldResolver } from 'graphql';
import db from '../../../database';
import { pubsub } from '../pubsub';
import { MutationContext } from '../types';

interface UpdateTeamArrivalArgs {
  teamId: string;
  arrived: boolean;
}

interface TeamArrivalPayload {
  teamId: string;
  divisionId: string;
  arrived: boolean;
  updatedAt: string;
}

/**
 * Mutation resolver for updating team arrival status
 * The divisionId is automatically scoped from the WebSocket connection context for security
 * This prevents clients from accidentally (or maliciously) updating teams in other divisions
 * This also publishes the update to all subscribed clients
 */
export const updateTeamArrivalResolver: GraphQLFieldResolver<
  unknown,
  MutationContext,
  UpdateTeamArrivalArgs,
  Promise<TeamArrivalPayload>
> = async (_, args, context) => {
  const { teamId, arrived } = args;
  const divisionId = context.divisionId;

  if (!divisionId) {
    throw new Error('No division context available. Connection must include divisionId.');
  }

  try {
    // Update the arrival status in the database
    const result = await db.raw.sql
      .updateTable('team_divisions')
      .set({ arrived: arrived as never }) // Cast to never bc TS is annoying
      .where('team_id', '=', teamId)
      .where('division_id', '=', divisionId)
      .returningAll()
      .executeTakeFirst();

    if (!result) {
      throw new Error(`Team ${teamId} not found in division ${divisionId}`);
    }

    const payload: TeamArrivalPayload = {
      teamId,
      divisionId,
      arrived,
      updatedAt: new Date().toISOString()
    };

    // Publish the update to subscribers
    const channel = pubsub.divisionChannel(divisionId, 'teamArrivalUpdated');
    pubsub.publish(channel, payload);

    console.log(
      `✅ Team arrival updated: Team ${teamId} in division ${divisionId} - arrived: ${arrived}`
    );

    return payload;
  } catch (error) {
    console.error('Error updating team arrival status:', error);
    throw error;
  }
};
