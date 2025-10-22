import { GraphQLFieldResolver } from 'graphql';
import db from '../../../database';
import { EventGraphQL } from './resolver';

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

export const volunteerDivisionsResolver: GraphQLFieldResolver<
  VolunteerGraphQL,
  unknown,
  unknown,
  Promise<DivisionGraphQL[]>
> = async (volunteer: VolunteerGraphQL) => {
  try {
    // Fetch all divisions assigned to this specific volunteer via the junction table
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

    // If a specific role is requested, filter by role
    if (args.role) {
      query = query.where('event_users.role', '=', args.role);
    }

    const rolesResult = await query.execute();

    // Transform the results into VolunteerGraphQL objects with eventId and roleInfo
    return rolesResult.map(row => ({
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
