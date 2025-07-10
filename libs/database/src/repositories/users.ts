import { Kysely } from 'kysely';
import { DatabaseSchema } from '../schema';
import { InsertableUser, User } from '../schema/tables/users';

export class UsersRepository {
  constructor(private db: Kysely<DatabaseSchema>) {}

  async create(user: InsertableUser): Promise<User> {
    const [createdUser] = await this.db.insertInto('users').values(user).returningAll().execute();
    return createdUser;
  }

  async getById(id: string): Promise<User | null> {
    const user = await this.db
      .selectFrom('users')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();
    return user || null;
  }

  async getByUsername(username: string): Promise<User | null> {
    const user = await this.db
      .selectFrom('users')
      .selectAll()
      .where('username', '=', username)
      .executeTakeFirst();
    return user || null;
  }
}
