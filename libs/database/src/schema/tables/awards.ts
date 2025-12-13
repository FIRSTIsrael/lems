import { ColumnType, Insertable, Selectable, Updateable, Generated } from 'kysely';

export type AwardType = 'PERSONAL' | 'TEAM';

export interface AwardsTable {
  pk: ColumnType<number, never, never>; // Serial primary key
  id: ColumnType<string, never, never>; // UUID, generated
  division_id: string; // UUID foreign key to divisions.id
  name: string;
  index: number;
  place: number;
  type: AwardType;
  is_optional: boolean;
  show_places: Generated<boolean>;
  allow_nominations: boolean; // Whether to allow team nominations from the Core Values rubric
  winner_id: string | null; // UUID foreign key to teams.id (only for TEAM awards)
  winner_name: string | null; // VARCHAR(64) freetext (only for PERSONAL awards)
}

export type Award = Selectable<AwardsTable>;
export type InsertableAward = Insertable<AwardsTable>;
export type UpdateableAward = Updateable<AwardsTable>;
