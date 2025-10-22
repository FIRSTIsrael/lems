import { GraphQLFieldResolver } from 'graphql';
import db from '../../../database';
import { EventGraphQL } from './resolver';

export interface DivisionGraphQLForEvent {
  id: string;
  name: string;
  color: string;
}

export const eventDivisionsResolver: GraphQLFieldResolver<
  EventGraphQL,
  unknown,
  unknown,
  Promise<DivisionGraphQLForEvent[]>
> = async (event: EventGraphQL) => {
  try {
    const divisions = await db.events.byId(event.id).getDivisions();
    return divisions.map(d => ({ id: d.id, name: d.name, color: d.color }));
  } catch (error) {
    console.error('Error fetching divisions for event:', event.id, error);
    throw error;
  }
};
