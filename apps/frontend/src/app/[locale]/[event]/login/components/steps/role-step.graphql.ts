import { z } from 'zod';
import { graphqlFetch } from '@lems/shared';

export const VolunteerRolesSchema = z.object({
  id: z.string(),
  volunteerRoles: z.array(z.string())
});

export type VolunteerRolesGraphQLData = z.infer<typeof VolunteerRolesSchema>;

export const VolunteerRolesResponseSchema = z.object({
  event: VolunteerRolesSchema.nullable()
});

export type VolunteerRolesResponseData = z.infer<typeof VolunteerRolesResponseSchema>;

const VOLUNTEER_ROLES_QUERY = `
  query GetVolunteerRoles($slug: String!) {
    event(slug: $slug) {
      id
      volunteerRoles
    }
  }
`;

/**
 * Fetch volunteer roles for an event by slug
 */
export const fetchVolunteerRoles = async (slug: string) => {
  const response = await graphqlFetch(VOLUNTEER_ROLES_QUERY, VolunteerRolesResponseSchema, { slug });
  if (!response.event) {
    throw new Error('Event not found');
  }
  return response.event.volunteerRoles;
};
