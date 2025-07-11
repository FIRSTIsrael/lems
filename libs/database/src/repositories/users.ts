import { Kysely } from 'kysely';
import { DatabaseSchema } from '../schema';
import { InsertableUser, User } from '../schema/tables/users';
import {
  InsertableUserPermission,
  PermissionType,
  UserPermission
} from '../schema/tables/user-permissions';

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

  async updateLastLogin(userId: string): Promise<void> {
    await this.db
      .updateTable('users')
      .set({ last_login: new Date() })
      .where('id', '=', userId)
      .execute();
  }

  // Permission-related methods
  async grantPermission(userId: string, permission: PermissionType): Promise<UserPermission> {
    const [grantedPermission] = await this.db
      .insertInto('user_permissions')
      .values({
        user_id: userId,
        permission: permission
      })
      .returningAll()
      .execute();
    return grantedPermission;
  }

  async revokePermission(userId: string, permission: PermissionType): Promise<void> {
    await this.db
      .deleteFrom('user_permissions')
      .where('user_id', '=', userId)
      .where('permission', '=', permission)
      .execute();
  }

  async getPermissions(userId: string): Promise<PermissionType[]> {
    const permissions = await this.db
      .selectFrom('user_permissions')
      .select('permission')
      .where('user_id', '=', userId)
      .execute();
    return permissions.map(p => p.permission);
  }

  async hasPermission(userId: string, permission: PermissionType): Promise<boolean> {
    const result = await this.db
      .selectFrom('user_permissions')
      .select('permission')
      .where('user_id', '=', userId)
      .where('permission', '=', permission)
      .executeTakeFirst();
    return !!result;
  }

  async getUsersWithPermission(permission: PermissionType): Promise<User[]> {
    const users = await this.db
      .selectFrom('users')
      .innerJoin('user_permissions', 'users.id', 'user_permissions.user_id')
      .selectAll('users')
      .where('user_permissions.permission', '=', permission)
      .execute();
    return users;
  }

  async getUserWithPermissions(
    userId: string
  ): Promise<(User & { permissions: PermissionType[] }) | null> {
    const user = await this.getById(userId);
    if (!user) return null;

    const permissions = await this.getPermissions(userId);
    return { ...user, permissions };
  }
}
