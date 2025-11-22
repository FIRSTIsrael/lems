import { GraphQLFieldResolver } from 'graphql';
import db from '../../../database';
import { EventGraphQL } from './resolver';

export const volunteerRolesResolver: GraphQLFieldResolver<
  EventGraphQL,
  unknown,
  unknown,
  Promise<string[]>
> = async (event: EventGraphQL) => {
  try {
    // Fetch all unique roles assigned to divisions in this event
    const divisions = await db.events.byId(event.id).getDivisions();
    const divisionIds = divisions.map(d => d.id);
    const volunteerRoles: string[] = [];

    if (divisionIds.length > 0) {
      const rolesResult = await db.raw.sql
        .selectFrom('event_users')
        .innerJoin('event_user_divisions', 'event_user_divisions.user_id', 'event_users.id')
        .where('event_user_divisions.division_id', 'in', divisionIds)
        .select('event_users.role')
        .distinct()
        .execute();

      volunteerRoles.push(...rolesResult.map(row => row.role));
    }

    return volunteerRoles;
  } catch (error) {
    console.error('Error fetching volunteer roles for event:', event.id, error);
    throw error;
  }
};
