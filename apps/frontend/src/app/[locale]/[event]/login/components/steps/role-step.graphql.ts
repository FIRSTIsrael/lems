import { z } from 'zod';
import { graphqlFetch } from '@lems/shared';

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
      id: z.string()
    })
  ),
  volunteers: z.array(
    z.object({
      role: z.string(),
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
      }
      volunteers(role: $role) {
        role
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
