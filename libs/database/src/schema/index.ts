import { UserTable } from './tables/users';

export interface DatabaseSchema {
  users: UserTable;
}
