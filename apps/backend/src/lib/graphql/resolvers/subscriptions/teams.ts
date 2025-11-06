import { GraphQLFieldResolver } from 'graphql';
import { RedisEventTypes } from '@lems/types/api/lems/redis';
import { getRedisPubSub } from '../../../redis/redis-pubsub';
import db from '../../../database';

interface TeamArrivalUpdatedArgs {
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
 * Resolver for Subscription.teamArrivalUpdated
 * Subscribes to team arrival events for a specific division
 */
export const teamArrivalUpdatedResolver: GraphQLFieldResolver<
  unknown,
  unknown,
  TeamArrivalUpdatedArgs,
  AsyncGenerator<TeamWithDivisionId, void, unknown>
> = async function* (_root, { divisionId }) {
  try {
    const pubSub = getRedisPubSub();

    for await (const event of pubSub.asyncIterator(divisionId, [RedisEventTypes.TEAM_ARRIVED])) {
      try {
        const teamId = (event.data.teamId as string) || '';

        const team = await db.raw.sql
          .selectFrom('teams')
          .select(['id', 'number', 'name', 'affiliation', 'city'])
          .where('id', '=', teamId)
          .executeTakeFirst();

        if (team) {
          yield {
            id: team.id,
            divisionId,
            number: team.number,
            name: team.name,
            affiliation: team.affiliation,
            city: team.city
          };
        }
      } catch (error) {
        console.error('Error processing team arrival event:', error);
        // Continue processing events even if one fails
      }
    }
  } catch (error) {
    console.error('Error in teamArrivalUpdated subscription:', error);
    throw error;
  }
};
