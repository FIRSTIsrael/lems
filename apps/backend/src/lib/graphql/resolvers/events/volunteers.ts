import { GraphQLFieldResolver } from 'graphql';
import db from '../../../database';
import type { EventGraphQL } from './resolver';

export type RoleInfoData = TableRoleInfo | RoomRoleInfo | CategoryRoleInfo;

export interface TableRoleInfo {
  tableId: string;
}

export interface RoomRoleInfo {
  roomId: string;
}

export interface CategoryRoleInfo {
  category: string;
}

export interface VolunteerGraphQL {
  id: string;
  role: string;
  roleInfo?: RoleInfoData | null;
  identifier?: string | null;
  eventId: string;
}

interface VolunteersArgs {
  role?: string;
}

export interface DivisionGraphQL {
  id: string;
}

/**
 * Resolver for Volunteer.divisions field.
 * Fetches all divisions a volunteer is assigned to.
 */
export const volunteerDivisionsResolver: GraphQLFieldResolver<
  VolunteerGraphQL,
  unknown,
  unknown,
  Promise<DivisionGraphQL[]>
> = async (volunteer: VolunteerGraphQL) => {
  try {
    const divisions = await db.raw.sql
      .selectFrom('event_user_divisions')
      .innerJoin('divisions', 'divisions.id', 'event_user_divisions.division_id')
      .where('event_user_divisions.user_id', '=', volunteer.id)
      .select('divisions.id')
      .execute();

    return divisions.map(d => ({ id: d.id }));
  } catch (error) {
    console.error('Error fetching divisions for volunteer:', volunteer.id, error);
    throw error;
  }
};

/**
 * Resolver for Event.volunteers field.
 * Fetches all volunteers for an event, optionally filtered by role.
 */
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
      .select([
        'event_users.id',
        'event_users.role',
        'event_users.role_info',
        'event_users.identifier'
      ])
      .distinct();

    // Filter by role if specified
    if (args.role) {
      query = query.where('event_users.role', '=', args.role);
    }

    const volunteers = await query.execute();

    return volunteers.map(row => ({
      id: row.id,
      role: row.role,
      roleInfo: row.role_info ? (row.role_info as unknown as RoleInfoData) : null,
      identifier: row.identifier || undefined,
      eventId: event.id
    }));
  } catch (error) {
    console.error('Error fetching volunteers for event:', event.id, error);
    throw error;
  }
};
