import { gql, type TypedDocumentNode } from '@apollo/client';
import type {
  GetVolunteerRolesQuery,
  GetVolunteerRolesQueryVariables,
  GetVolunteerByRoleQuery,
  GetVolunteerByRoleQueryVariables
} from './types';

export const GET_VOLUNTEER_ROLES_QUERY: TypedDocumentNode<
  GetVolunteerRolesQuery,
  GetVolunteerRolesQueryVariables
> = gql`
  query GetVolunteerRoles($slug: String!) {
    event(slug: $slug) {
      id
      volunteers {
        role
      }
    }
  }
`;

export const GET_VOLUNTEER_BY_ROLE_QUERY: TypedDocumentNode<
  GetVolunteerByRoleQuery,
  GetVolunteerByRoleQueryVariables
> = gql`
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

export type {
  GetVolunteerRolesQuery,
  GetVolunteerRolesQueryVariables,
  GetVolunteerByRoleQuery,
  GetVolunteerByRoleQueryVariables
};
