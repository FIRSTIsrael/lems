import { GraphQLFieldResolver } from 'graphql';
import { RedisEventTypes } from '@lems/types/api/lems/redis';
import db from '../../../database';
import { getRedisPubSub } from '../../../redis/redis-pubsub';

interface TeamArrivedArgs {
  teamId: string;
  divisionId: string;
}

interface TeamWithDivisionId {
  id: string;
  divisionId: string;
  number: number;
  name: string;
  affiliation: string;
  city: string;
}

/**
 * Resolver for Mutation.teamArrived
 * Marks that a team arrived at a division and publishes an event
 */
export const teamArrivedResolver: GraphQLFieldResolver<
  unknown,
  unknown,
  TeamArrivedArgs,
  Promise<TeamWithDivisionId>
> = async (_root, { teamId, divisionId }) => {
  try {
    const update: Record<string, unknown> = { arrived: true };
    await db.raw.sql
      .updateTable('team_divisions')
      .set(update)
      .where('team_id', '=', teamId)
      .where('division_id', '=', divisionId)
      .execute();

    const team = await db.raw.sql
      .selectFrom('teams')
      .select(['id', 'number', 'name', 'affiliation', 'city'])
      .where('id', '=', teamId)
      .executeTakeFirst();

    if (!team) {
      throw new Error(`Team with ID ${teamId} not found`);
    }

    const pubSub = getRedisPubSub();
    await pubSub.publish(divisionId, RedisEventTypes.TEAM_ARRIVED, { teamId });

    return {
      divisionId,
      id: team.id,
      number: team.number,
      name: team.name,
      affiliation: team.affiliation,
      city: team.city
    };
  } catch (error) {
    console.error(
      'Error updating team arrival status for team:',
      teamId,
      'in division:',
      divisionId,
      error
    );
    throw error;
  }
};
