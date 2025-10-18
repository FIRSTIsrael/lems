import { GraphQLFieldResolver } from 'graphql';
import db from '../../../database';
import { EventGraphQL } from './resolver';

export interface VolunteerGraphQL {
  role: string;
  eventId: string;
}

interface VolunteersArgs {
  role?: string;
}

export interface DivisionGraphQL {
  id: string;
}

export const divisionsResolver: GraphQLFieldResolver<
  VolunteerGraphQL,
  unknown,
  unknown,
  Promise<DivisionGraphQL[]>
> = async (volunteer: VolunteerGraphQL) => {
  try {
    // Fetch all divisions that have this volunteer role
    const divisions = await db.raw.sql
      .selectFrom('event_users')
      .innerJoin('event_user_divisions', 'event_user_divisions.user_id', 'event_users.id')
      .innerJoin('divisions', 'divisions.id', 'event_user_divisions.division_id')
      .where('event_users.event_id', '=', volunteer.eventId)
      .where('event_users.role', '=', volunteer.role)
      .select('divisions.id')
      .distinct()
      .execute();

    return divisions.map(d => ({ id: d.id }));
  } catch (error) {
    console.error('Error fetching divisions for volunteer role:', volunteer.role, error);
    throw error;
  }
};

export const volunteersResolver: GraphQLFieldResolver<
  EventGraphQL,
  unknown,
  VolunteersArgs,
  Promise<VolunteerGraphQL[]>
> = async (event: EventGraphQL, args: VolunteersArgs) => {
  try {
    let query = db.raw.sql
      .selectFrom('event_users')
      .where('event_users.event_id', '=', event.id)
      .select('event_users.role')
      .distinct();

    // If a specific role is requested, filter by role
    if (args.role) {
      query = query.where('event_users.role', '=', args.role);
    }

    const rolesResult = await query.execute();

    // Transform the results into VolunteerGraphQL objects with eventId
    return rolesResult.map(row => ({
      role: row.role,
      eventId: event.id
    }));
  } catch (error) {
    console.error('Error fetching volunteers for event:', event.id, error);
    throw error;
  }
};
