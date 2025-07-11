import { Kysely } from 'kysely';
import { DatabaseSchema } from '../schema';
import { InsertableUser, User } from '../schema/tables/users';
import { PermissionType, UserPermission } from '../schema/tables/user-permissions';

class UserSelector {
  private includePermissions = false;

  constructor(
    private db: Kysely<DatabaseSchema>,
    private selector: { type: 'id' | 'username'; value: string }
  ) {}

  withPermissions(): UserSelector {
    this.includePermissions = true;
    return this;
  }

  async get(): Promise<User | null>;
  async get<T extends boolean>(
    this: T extends true ? UserSelector & { includePermissions: true } : UserSelector
  ): Promise<T extends true ? (User & { permissions: PermissionType[] }) | null : User | null>;
  async get(): Promise<User | (User & { permissions: PermissionType[] }) | null> {
    const query = this.db.selectFrom('users').selectAll();

    let user: User | undefined;
    if (this.selector.type === 'id') {
      user = await query.where('id', '=', this.selector.value).executeTakeFirst();
    } else {
      user = await query.where('username', '=', this.selector.value).executeTakeFirst();
    }

    if (!user) return null;

    if (this.includePermissions) {
      const permissions = await this.db
        .selectFrom('user_permissions')
        .select('permission')
        .where('user_id', '=', user.id)
        .execute();

      return { ...user, permissions: permissions.map(p => p.permission) } as User & {
        permissions: PermissionType[];
      };
    }

    return user;
  }

  async grantPermission(permission: PermissionType): Promise<UserPermission> {
    const user = await this.get();
    if (!user) throw new Error(`User not found`);

    const [grantedPermission] = await this.db
      .insertInto('user_permissions')
      .values({
        user_id: user.id,
        permission: permission
      })
      .returningAll()
      .execute();
    return grantedPermission;
  }

  async removePermission(permission: PermissionType): Promise<void> {
    const user = await this.get();
    if (!user) throw new Error(`User not found`);

    await this.db
      .deleteFrom('user_permissions')
      .where('user_id', '=', user.id)
      .where('permission', '=', permission)
      .execute();
  }

  async hasPermission(permission: PermissionType): Promise<boolean> {
    const user = await this.get();
    if (!user) return false;

    const result = await this.db
      .selectFrom('user_permissions')
      .select('permission')
      .where('user_id', '=', user.id)
      .where('permission', '=', permission)
      .executeTakeFirst();
    return !!result;
  }

  async getPermissions(): Promise<PermissionType[]> {
    const user = await this.get();
    if (!user) return [];

    const permissions = await this.db
      .selectFrom('user_permissions')
      .select('permission')
      .where('user_id', '=', user.id)
      .execute();
    return permissions.map(p => p.permission);
  }

  async updateLastLogin(): Promise<void> {
    const user = await this.get();
    if (!user) throw new Error(`User not found`);

    await this.db
      .updateTable('users')
      .set({ last_login: new Date() })
      .where('id', '=', user.id)
      .execute();
  }
}

export class UsersRepository {
  constructor(private db: Kysely<DatabaseSchema>) {}

  // Fluent selector methods
  byId(id: string): UserSelector {
    return new UserSelector(this.db, { type: 'id', value: id });
  }

  byUsername(username: string): UserSelector {
    return new UserSelector(this.db, { type: 'username', value: username });
  }

  // Direct methods for operations that don't need selectors
  async create(user: InsertableUser): Promise<User> {
    const [createdUser] = await this.db.insertInto('users').values(user).returningAll().execute();
    return createdUser;
  }
}
