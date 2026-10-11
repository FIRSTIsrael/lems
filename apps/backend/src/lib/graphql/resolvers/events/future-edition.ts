import { GraphQLFieldResolver } from 'graphql';
import { getEventEdition } from '@lems/shared/edition';
import db from '../../../database';
import type { EventGraphQL } from './resolver';

/**
 * Resolver for Event.futureEdition field.
 * True when any division of the event is Future Edition.
 *
 * Note: This field is pre-computed in Query.events(), so this resolver
 * only needs to compute it for single event queries.
 */
export const futureEditionResolver: GraphQLFieldResolver<
  EventGraphQL,
  unknown,
  unknown,
  Promise<boolean>
> = async (event: EventGraphQL) => {
  if (event.futureEdition !== undefined) {
    return event.futureEdition;
  }

  try {
    const divisions = await db.events.byId(event.id).getDivisions();
    return (
      getEventEdition(divisions.map(division => ({ futureEdition: division.future_edition }))) ===
      'future'
    );
  } catch (error) {
    console.error('Error fetching futureEdition for event:', event.id, error);
    throw error;
  }
};
