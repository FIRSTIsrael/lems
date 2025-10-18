import { z } from 'zod';
import { graphqlFetch } from '@lems/shared';

export const TableRoleInfoSchema = z.object({
  __typename: z.literal('TableRoleInfo'),
  tableId: z.string()
});

export const RoomRoleInfoSchema = z.object({
  __typename: z.literal('RoomRoleInfo'),
  roomId: z.string()
});

export const CategoryRoleInfoSchema = z.object({
  __typename: z.literal('CategoryRoleInfo'),
  category: z.string()
});

export const RoleInfoSchema = z.union([
  TableRoleInfoSchema,
  RoomRoleInfoSchema,
  CategoryRoleInfoSchema
]);

export type TableRoleInfo = z.infer<typeof TableRoleInfoSchema>;
export type RoomRoleInfo = z.infer<typeof RoomRoleInfoSchema>;
export type CategoryRoleInfo = z.infer<typeof CategoryRoleInfoSchema>;
export type RoleInfo = z.infer<typeof RoleInfoSchema>;

export const VolunteerRolesSchema = z.object({
  id: z.string(),
  volunteers: z.array(
    z.object({
      role: z.string()
    })
  )
});

export type VolunteerRolesGraphQLData = z.infer<typeof VolunteerRolesSchema>;

export const VolunteerRolesResponseSchema = z.object({
  event: VolunteerRolesSchema.nullable()
});

export type VolunteerRolesResponseData = z.infer<typeof VolunteerRolesResponseSchema>;

// Schema for fetching volunteers by role with their divisions
export const VolunteerByRoleSchema = z.object({
  id: z.string(),
  divisions: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      color: z.string()
    })
  ),
  volunteers: z.array(
    z.object({
      id: z.string(),
      role: z.string(),
      roleInfo: RoleInfoSchema.nullish(),
      identifier: z.string().nullish(),
      divisions: z.array(
        z.object({
          id: z.string()
        })
      )
    })
  )
});

export type VolunteerByRoleGraphQLData = z.infer<typeof VolunteerByRoleSchema>;

export const VolunteerByRoleResponseSchema = z.object({
  event: VolunteerByRoleSchema.nullable()
});

export type VolunteerByRoleResponseData = z.infer<typeof VolunteerByRoleResponseSchema>;

const VOLUNTEER_ROLES_QUERY = `
  query GetVolunteerRoles($slug: String!) {
    event(slug: $slug) {
      id
      volunteers {
        role
      }
    }
  }
`;

const VOLUNTEER_BY_ROLE_QUERY = `
  query GetVolunteerByRole($slug: String!, $role: String!) {
    event(slug: $slug) {
      id
      divisions {
        id
        name
        color
      }
      volunteers(role: $role) {
        id
        role
        roleInfo {
          __typename
          ... on TableRoleInfo {
            tableId
          }
          ... on RoomRoleInfo {
            roomId
          }
          ... on CategoryRoleInfo {
            category
          }
        }
        identifier
        divisions {
          id
        }
      }
    }
  }
`;

/**
 * Fetch all unique volunteer roles for an event by slug
 */
export const fetchVolunteerRoles = async (slug: string) => {
  const response = await graphqlFetch(VOLUNTEER_ROLES_QUERY, VolunteerRolesResponseSchema, {
    slug
  });
  if (!response.event) {
    throw new Error('Event not found');
  }
  // Transform the volunteers array into a Set of unique roles
  return Array.from(new Set(response.event.volunteers.map(v => v.role)));
};

/**
 * Fetch volunteer data by role for an event by slug
 */
export const fetchVolunteerByRole = async (slug: string, role: string) => {
  const response = await graphqlFetch(VOLUNTEER_BY_ROLE_QUERY, VolunteerByRoleResponseSchema, {
    slug,
    role
  });
  if (!response.event) {
    throw new Error('Event not found');
  }
  return response.event;
};
