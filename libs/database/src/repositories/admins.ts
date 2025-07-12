import { Kysely } from 'kysely';
import { DatabaseSchema } from '../schema';
import { InsertableAdmin, Admin } from '../schema/tables/admins';
import { PermissionType, AdminPermission } from '../schema/tables/admin-permissions';

declare const WithPermissionsBrand: unique symbol;

type AdminWithPermissions = Admin & { permissions: PermissionType[] };

type AdminSelectorWithPermissions = AdminSelector & {
  readonly [WithPermissionsBrand]: true;
};

type AdminSelectorWithoutPermissions = AdminSelector & {
  readonly [WithPermissionsBrand]: false;
};

class AdminSelector {
  private includePermissions = false;

  constructor(
    private db: Kysely<DatabaseSchema>,
    private selector: { type: 'id' | 'username'; value: string }
  ) {}

  withPermissions(): AdminSelectorWithPermissions {
    const newSelector = new AdminSelector(this.db, this.selector);
    newSelector.includePermissions = true;
    return newSelector as AdminSelectorWithPermissions;
  }

  private getAdminQuery() {
    const query = this.db.selectFrom('admins').selectAll();

    if (this.selector.type === 'id') {
      return query.where('id', '=', this.selector.value);
    } else {
      return query.where('username', '=', this.selector.value);
    }
  }

  private getAdminIdQuery() {
    const query = this.db.selectFrom('admins').select('id');

    if (this.selector.type === 'id') {
      return query.where('id', '=', this.selector.value);
    } else {
      return query.where('username', '=', this.selector.value);
    }
  }

  // Method overloads for type safety
  get(this: AdminSelectorWithPermissions): Promise<AdminWithPermissions | null>;
  get(this: AdminSelectorWithoutPermissions): Promise<Admin | null>;
  get(this: AdminSelector): Promise<Admin | AdminWithPermissions | null>;
  async get(): Promise<Admin | AdminWithPermissions | null> {
    const admin = await this.getAdminQuery().executeTakeFirst();
    if (!admin) return null;

    if (this.includePermissions) {
      const permissions = await this.db
        .selectFrom('admin_permissions')
        .select('permission')
        .where('admin_id', '=', admin.id)
        .execute();

      return { ...admin, permissions: permissions.map(p => p.permission) } as AdminWithPermissions;
    }

    return admin;
  }

  async grantPermission(permission: PermissionType): Promise<AdminPermission> {
    const adminIdResult = await this.getAdminIdQuery().executeTakeFirst();
    if (!adminIdResult) throw new Error(`Admin not found`);

    const [grantedPermission] = await this.db
      .insertInto('admin_permissions')
      .values({
        admin_id: adminIdResult.id,
        permission: permission
      })
      .returningAll()
      .execute();
    return grantedPermission;
  }

  async removePermission(permission: PermissionType): Promise<void> {
    await this.db
      .deleteFrom('admin_permissions')
      .where('admin_id', '=', this.getAdminIdQuery())
      .where('permission', '=', permission)
      .execute();
  }

  async hasPermission(permission: PermissionType): Promise<boolean> {
    const result = await this.db
      .selectFrom('admin_permissions')
      .select('permission')
      .where('admin_id', '=', this.getAdminIdQuery())
      .where('permission', '=', permission)
      .executeTakeFirst();
    return !!result;
  }

  async getPermissions(): Promise<PermissionType[]> {
    const permissions = await this.db
      .selectFrom('admin_permissions')
      .select('permission')
      .where('admin_id', '=', this.getAdminIdQuery())
      .execute();
    return permissions.map(p => p.permission);
  }

  async updateLastLogin(): Promise<void> {
    await this.db
      .updateTable('admins')
      .set({ last_login: new Date() })
      .where('id', '=', this.getAdminIdQuery())
      .execute();
  }
}

export class AdminsRepository {
  constructor(private db: Kysely<DatabaseSchema>) {}

  // Fluent selector methods - properly typed
  byId(id: string): AdminSelectorWithoutPermissions {
    return new AdminSelector(this.db, { type: 'id', value: id }) as AdminSelectorWithoutPermissions;
  }

  byUsername(username: string): AdminSelectorWithoutPermissions {
    return new AdminSelector(this.db, {
      type: 'username',
      value: username
    }) as AdminSelectorWithoutPermissions;
  }

  // Direct methods for operations that don't need selectors
  async create(admin: InsertableAdmin): Promise<Admin> {
    const [createdAdmin] = await this.db
      .insertInto('admins')
      .values(admin)
      .returningAll()
      .execute();
    return createdAdmin;
  }
}
