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

async function* teamArrivalUpdatedGenerator(
  _root: unknown,
  args: TeamArrivalUpdatedArgs
): AsyncGenerator<TeamWithDivisionId, void, unknown> {
  const { divisionId } = args;

  if (!divisionId) {
    throw new Error('divisionId is required for teamArrivalUpdated subscription');
  }

  try {
    const pubSub = getRedisPubSub();
    const iterator = pubSub.asyncIterator(divisionId, [RedisEventTypes.TEAM_ARRIVED]);

    for await (const event of iterator) {
      try {
        const teamId = (event.data.teamId as string) || '';

        if (!teamId) {
          continue;
        }

        const team = await db.raw.sql
          .selectFrom('teams')
          .select(['id', 'number', 'name', 'affiliation', 'city'])
          .where('id', '=', teamId)
          .executeTakeFirst();

        if (team) {
          const result = {
            id: team.id,
            divisionId,
            number: team.number,
            name: team.name,
            affiliation: team.affiliation,
            city: team.city
          };
          yield result;
        }
      } catch (error) {
        console.error('Error processing team arrival event:', error);
      }
    }
  } catch (error) {
    console.error('Error in teamArrivalUpdated subscription:', error);
    throw error;
  }
}

/**
 * Resolver function for the teamArrivalUpdated subscription field
 * Returns an async generator that yields team data
 */
const teamArrivalUpdatedSubscribe = (root: unknown, args: unknown) => {
  const typedArgs = args as TeamArrivalUpdatedArgs;

  if (!typedArgs || !typedArgs.divisionId) {
    const errorMsg = 'divisionId is required for teamArrivalUpdated subscription';
    throw new Error(errorMsg);
  }

  const generator = teamArrivalUpdatedGenerator(root, typedArgs);

  return generator;
};

/**
 * Subscription resolver object for teamArrivalUpdated
 * GraphQL subscriptions require a subscribe function
 */
export const teamArrivalUpdatedResolver = {
  subscribe: teamArrivalUpdatedSubscribe,
  resolve: (team: TeamWithDivisionId) => {
    return team;
  }
};
