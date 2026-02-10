import { ColumnType, Insertable, Selectable, Updateable } from 'kysely';

export interface PitMapAssignmentsTable {
  pk: ColumnType<number, never, never>; // Serial primary key
  id: ColumnType<string, never, never>; // UUID, generated
  pit_map_area_id: string; // UUID foreign key to pit_map_areas.id
  team_id: string; // UUID foreign key to teams.id
  position_x: number; // X coordinate within the area (percentage 0-100)
  position_y: number; // Y coordinate within the area (percentage 0-100)
  spot_number: number; // Sequential number within the area
  created_at: ColumnType<Date, never, never>; // Timestamp
}

export type PitMapAssignment = Selectable<PitMapAssignmentsTable>;
export type InsertablePitMapAssignment = Insertable<PitMapAssignmentsTable>;
export type UpdateablePitMapAssignment = Updateable<PitMapAssignmentsTable>;

// Utility type for team with pit assignment
export interface TeamWithPitAssignment {
  team_id: string;
  team_number: number;
  team_name: string;
  team_affiliation: string;
  area_id: string;
  area_name: string;
  position_x: number;
  position_y: number;
  spot_number: number;
}
