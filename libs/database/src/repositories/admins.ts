import { Kysely } from 'kysely';
import { KyselyDatabaseSchema } from '../schema/kysely';
import { InsertableAdmin, Admin } from '../schema/tables/admins';
import { PermissionType, AdminPermission } from '../schema/tables/admin-permissions';

class AdminSelector {
  constructor(
    private db: Kysely<KyselyDatabaseSchema>,
    private selector: { type: 'id' | 'username'; value: string }
  ) {}

  private getAdminQuery() {
    const query = this.db.selectFrom('admins').selectAll();
    return query.where(this.selector.type, '=', this.selector.value);
  }

  private getAdminIdQuery() {
    const query = this.db.selectFrom('admins').select('id');

    if (this.selector.type === 'id') {
      return query.where('id', '=', this.selector.value);
    } else {
      return query.where('username', '=', this.selector.value);
    }
  }

  async get(): Promise<Admin | null> {
    const admin = await this.getAdminQuery().executeTakeFirst();
    return admin || null;
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
  constructor(private db: Kysely<KyselyDatabaseSchema>) {}

  byId(id: string): AdminSelector {
    return new AdminSelector(this.db, { type: 'id', value: id });
  }

  byUsername(username: string): AdminSelector {
    return new AdminSelector(this.db, {
      type: 'username',
      value: username
    });
  }

  async getAll(): Promise<Admin[]> {
    const admins = await this.db.selectFrom('admins').selectAll().execute();
    return admins;
  }

  async create(admin: InsertableAdmin): Promise<Admin> {
    const [createdAdmin] = await this.db
      .insertInto('admins')
      .values(admin)
      .returningAll()
      .execute();
    return createdAdmin;
  }
}
