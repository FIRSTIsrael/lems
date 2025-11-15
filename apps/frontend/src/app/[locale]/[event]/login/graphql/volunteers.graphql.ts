import { gql } from '@apollo/client';
import type { TypedDocumentNode } from '@apollo/client';

// Type definitions for role info
type TableRoleInfo = {
  __typename: 'TableRoleInfo';
  tableId: string;
};

type RoomRoleInfo = {
  __typename: 'RoomRoleInfo';
  roomId: string;
};

type CategoryRoleInfo = {
  __typename: 'CategoryRoleInfo';
  category: string;
};

export type RoleInfo = TableRoleInfo | RoomRoleInfo | CategoryRoleInfo;

export interface VolunteerByRoleGraphQLData {
  id: string;
  divisions: {
    id: string;
    name: string;
    color: string;
  }[];
  volunteers: {
    id: string;
    role: string;
    roleInfo: RoleInfo | null | undefined;
    identifier: string | null | undefined;
    divisions: Array<{ id: string }>;
  }[];
}

// Query result types
type GetVolunteerRolesQuery = {
  event: {
    id: string;
    volunteers: Array<{
      role: string;
    }>;
  } | null;
};

type GetVolunteerRolesQueryVariables = {
  slug: string;
};

type GetVolunteerByRoleQuery = {
  event: VolunteerByRoleGraphQLData | null;
};

type GetVolunteerByRoleQueryVariables = {
  slug: string;
  role: string;
};

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
