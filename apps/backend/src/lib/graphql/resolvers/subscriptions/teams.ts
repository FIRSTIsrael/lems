import { RedisEventTypes } from '@lems/types/api/lems/redis';
import db from '../../../database';
import {
  createSubscriptionIterator,
  isGapMarker,
  SubscriptionResult,
  BaseSubscriptionArgs
} from './base-subscription';

interface TeamWithDivisionId {
  id: string;
  divisionId: string;
  number: number;
  name: string;
  affiliation: string;
  city: string;
  arrived: boolean;
}

/**
 * Resolver function for the teamArrivalUpdated subscription field
 * Supports message recovery via lastSeenVersion parameter.
 * If client was disconnected < 30 seconds, buffered messages are automatically recovered.
 */
const teamArrivalUpdatedSubscribe = (
  _root: unknown,
  args: BaseSubscriptionArgs & Record<string, unknown>
) => {
  const divisionId = args.divisionId as string;

  if (!divisionId) {
    const errorMsg = 'divisionId is required for teamArrivalUpdated subscription';
    throw new Error(errorMsg);
  }

  const lastSeenVersion = (args.lastSeenVersion as number) || 0;
  return createSubscriptionIterator(divisionId, RedisEventTypes.TEAM_ARRIVED, lastSeenVersion);
};

/**
 * Transforms raw Redis events into Team objects with division context
 */
const processTeamArrivalEvent = async (
  divisionId: string,
  event: Record<string, unknown>
): Promise<SubscriptionResult<TeamWithDivisionId>> => {
  // Check for gap marker (recovery buffer exceeded)
  if (isGapMarker(event.data)) {
    console.warn(
      `[TeamArrival] Recovery gap detected for division ${divisionId} - client should refetch`
    );
    return event.data;
  }

  const teamId = ((event.data as Record<string, unknown>).teamId as string) || '';

  if (!teamId) {
    return null;
  }

  try {
    const team = await db.raw.sql
      .selectFrom('teams')
      .select(['id', 'number', 'name', 'affiliation', 'city'])
      .where('id', '=', teamId)
      .executeTakeFirst();

    if (team) {
      // Get arrival status from team_divisions
      const teamDivision = await db.raw.sql
        .selectFrom('team_divisions')
        .select('arrived')
        .where('team_id', '=', teamId)
        .where('division_id', '=', divisionId)
        .executeTakeFirst();

      const result: TeamWithDivisionId = {
        id: team.id,
        divisionId,
        number: team.number,
        name: team.name,
        affiliation: team.affiliation,
        city: team.city,
        arrived: teamDivision?.arrived ?? false
      };
      return result;
    }
  } catch (error) {
    console.error('Error processing team arrival event:', error);
  }

  return null;
};

/**
 * Subscription resolver object for teamArrivalUpdated
 * GraphQL subscriptions require a subscribe function
 */
export const teamArrivalUpdatedResolver = {
  subscribe: teamArrivalUpdatedSubscribe,
  resolve: async (
    event: Record<string, unknown>
  ): Promise<SubscriptionResult<TeamWithDivisionId>> => {
    // The event contains division context from the subscription args
    const divisionId = (event as unknown as { divisionId: string }).divisionId;
    if (!divisionId) {
      throw new Error('divisionId missing from subscription event');
    }
    return processTeamArrivalEvent(divisionId, event);
  }
};
