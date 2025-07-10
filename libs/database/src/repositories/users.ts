import { Kysely } from 'kysely';
import { DatabaseSchema } from '../schema';

export interface User {
  id: string;
  username: string;
  password_hash: string;
  password_salt: string;
  first_name: string;
  last_name: string;
  last_login: Date | null;
  last_password_set_date: Date;
  created_at: Date;
  last_updated: Date;
}

export class UsersRepository {
  constructor(private db: Kysely<DatabaseSchema>) {}

  async getById(id: string): Promise<User | null> {
    const user = await this.db
      .selectFrom('users')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();
    return user || null;
  }
}
