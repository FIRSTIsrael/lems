import { Kysely } from 'kysely';
import { DatabaseSchema } from '../schema';
import { InsertableUser, User } from '../schema/tables/users';
import { PermissionType, UserPermission } from '../schema/tables/user-permissions';

declare const WithPermissionsBrand: unique symbol;

type UserWithPermissions = User & { permissions: PermissionType[] };

type UserSelectorWithPermissions = UserSelector & {
  readonly [WithPermissionsBrand]: true;
};

type UserSelectorWithoutPermissions = UserSelector & {
  readonly [WithPermissionsBrand]: false;
};

class UserSelector {
  private includePermissions = false;

  constructor(
    private db: Kysely<DatabaseSchema>,
    private selector: { type: 'id' | 'username'; value: string }
  ) {}

  withPermissions(): UserSelectorWithPermissions {
    const newSelector = new UserSelector(this.db, this.selector);
    newSelector.includePermissions = true;
    return newSelector as UserSelectorWithPermissions;
  }

  private getUserQuery() {
    const query = this.db.selectFrom('users').selectAll();

    if (this.selector.type === 'id') {
      return query.where('id', '=', this.selector.value);
    } else {
      return query.where('username', '=', this.selector.value);
    }
  }

  private getUserIdQuery() {
    const query = this.db.selectFrom('users').select('id');

    if (this.selector.type === 'id') {
      return query.where('id', '=', this.selector.value);
    } else {
      return query.where('username', '=', this.selector.value);
    }
  }

  // Method overloads for type safety
  get(this: UserSelectorWithPermissions): Promise<UserWithPermissions | null>;
  get(this: UserSelectorWithoutPermissions): Promise<User | null>;
  get(this: UserSelector): Promise<User | UserWithPermissions | null>;
  async get(): Promise<User | UserWithPermissions | null> {
    const user = await this.getUserQuery().executeTakeFirst();
    if (!user) return null;

    if (this.includePermissions) {
      const permissions = await this.db
        .selectFrom('user_permissions')
        .select('permission')
        .where('user_id', '=', user.id)
        .execute();

      return { ...user, permissions: permissions.map(p => p.permission) } as UserWithPermissions;
    }

    return user;
  }

  async grantPermission(permission: PermissionType): Promise<UserPermission> {
    const userIdResult = await this.getUserIdQuery().executeTakeFirst();
    if (!userIdResult) throw new Error(`User not found`);

    const [grantedPermission] = await this.db
      .insertInto('user_permissions')
      .values({
        user_id: userIdResult.id,
        permission: permission
      })
      .returningAll()
      .execute();
    return grantedPermission;
  }

  async removePermission(permission: PermissionType): Promise<void> {
    await this.db
      .deleteFrom('user_permissions')
      .where('user_id', '=', this.getUserIdQuery())
      .where('permission', '=', permission)
      .execute();
  }

  async hasPermission(permission: PermissionType): Promise<boolean> {
    const result = await this.db
      .selectFrom('user_permissions')
      .select('permission')
      .where('user_id', '=', this.getUserIdQuery())
      .where('permission', '=', permission)
      .executeTakeFirst();
    return !!result;
  }

  async getPermissions(): Promise<PermissionType[]> {
    const permissions = await this.db
      .selectFrom('user_permissions')
      .select('permission')
      .where('user_id', '=', this.getUserIdQuery())
      .execute();
    return permissions.map(p => p.permission);
  }

  async updateLastLogin(): Promise<void> {
    await this.db
      .updateTable('users')
      .set({ last_login: new Date() })
      .where('id', '=', this.getUserIdQuery())
      .execute();
  }
}

export class UsersRepository {
  constructor(private db: Kysely<DatabaseSchema>) {}

  // Fluent selector methods - properly typed
  byId(id: string): UserSelectorWithoutPermissions {
    return new UserSelector(this.db, { type: 'id', value: id }) as UserSelectorWithoutPermissions;
  }

  byUsername(username: string): UserSelectorWithoutPermissions {
    return new UserSelector(this.db, {
      type: 'username',
      value: username
    }) as UserSelectorWithoutPermissions;
  }

  // Direct methods for operations that don't need selectors
  async create(user: InsertableUser): Promise<User> {
    const [createdUser] = await this.db.insertInto('users').values(user).returningAll().execute();
    return createdUser;
  }
}
