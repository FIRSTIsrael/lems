import { ColumnType } from 'kysely';

export interface UserTable {
  id: ColumnType<string, never, never>; // UUID, generated
  username: string;
  password_hash: string;
  password_salt: string;
  first_name: string;
  last_name: string;
  last_login: Date | null;
  last_password_set_date: Date;
  created_at: ColumnType<Date, never, never>; // Generated on insert
  last_updated: ColumnType<Date, never, Date>; // Updated automatically
}
