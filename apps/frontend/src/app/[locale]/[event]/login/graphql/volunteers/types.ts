export type TableRoleInfo = {
  __typename: 'TableRoleInfo';
  tableId: string;
};

export type RoomRoleInfo = {
  __typename: 'RoomRoleInfo';
  roomId: string;
};

export type CategoryRoleInfo = {
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

export type GetVolunteerRolesQuery = {
  event: {
    id: string;
    volunteers: Array<{
      role: string;
    }>;
  } | null;
};

export type GetVolunteerRolesQueryVariables = {
  slug: string;
};

export type GetVolunteerByRoleQuery = {
  event: VolunteerByRoleGraphQLData | null;
};

export type GetVolunteerByRoleQueryVariables = {
  slug: string;
  role: string;
};
