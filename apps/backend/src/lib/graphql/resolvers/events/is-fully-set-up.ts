import { GraphQLFieldResolver } from 'graphql';
import db from '../../../database';
import type { EventGraphQL } from './resolver';

/**
 * Resolver for Event.isFullySetUp field.
 * Checks if all divisions have awards, users, and schedule configured.
 *
 * Note: This field is pre-computed in Query.events() where possible,
 * so this resolver only needs to compute it for single event queries.
 */
export const isFullySetUpResolver: GraphQLFieldResolver<
  EventGraphQL,
  unknown,
  unknown,
  Promise<boolean>
> = async (event: EventGraphQL) => {
  // Return cached value if already computed
  if (event.isFullySetUp !== undefined) {
    return event.isFullySetUp;
  }

  try {
    const divisions = await db.events.byId(event.id).getDivisions();
    return divisions.every(
      division => division.has_awards && division.has_users && division.has_schedule
    );
  } catch (error) {
    console.error('Error fetching isFullySetUp for event:', event.id, error);
    throw error;
  }
};
