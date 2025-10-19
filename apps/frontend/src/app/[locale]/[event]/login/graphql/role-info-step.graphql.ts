import { z } from 'zod';
import { graphqlFetch } from '@lems/shared';

export const TableSchema = z.object({
  id: z.string(),
  name: z.string()
});

export const RoomSchema = z.object({
  id: z.string(),
  name: z.string()
});

export const DivisionRoleInfoSchema = z.object({
  id: z.string(),
  tables: z.array(TableSchema),
  rooms: z.array(RoomSchema)
});

export type Table = z.infer<typeof TableSchema>;
export type Room = z.infer<typeof RoomSchema>;
export type DivisionRoleInfo = z.infer<typeof DivisionRoleInfoSchema>;

export const DivisionRoleInfoResponseSchema = z.object({
  division: DivisionRoleInfoSchema.nullable()
});

export type DivisionRoleInfoResponseData = z.infer<typeof DivisionRoleInfoResponseSchema>;

const DIVISION_VENUE_QUERY = `
  query GetDivisionVenue($id: String!) {
    division(id: $id) {
      id
      tables {
        id
        name
      }
      rooms {
        id
        name
      }
    }
  }
`;

/**
 * Fetch tables and rooms for a specific division
 */
export const fetchDivisionVenue = async (divisionId: string) => {
  const response = await graphqlFetch(DIVISION_VENUE_QUERY, DivisionRoleInfoResponseSchema, {
    id: divisionId
  });

  if (!response.division) {
    throw new Error(`Division with ID ${divisionId} not found`);
  }

  return response.division;
};
