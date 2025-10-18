import { GraphQLFieldResolver } from 'graphql';
import db from '../../../database';
import { EventGraphQL } from './resolver';

export const isFullySetUpResolver: GraphQLFieldResolver<
  EventGraphQL,
  unknown,
  unknown,
  Promise<boolean>
> = async (event: EventGraphQL) => {
  try {
    const divisions = await db.events.byId(event.id).getDivisions();
    const isFullySetUp = divisions.every(
      division => division.has_awards && division.has_users && division.has_schedule
    );
    return isFullySetUp;
  } catch (error) {
    console.error('Error fetching isFullySetUp for event:', event.id, error);
    throw error;
  }
};
