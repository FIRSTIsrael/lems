import { Kysely } from 'kysely';
import { KyselyDatabaseSchema } from '../schema/kysely';
import { InsertableAdmin, Admin } from '../schema/tables/admins';
import { PermissionType, AdminPermission } from '../schema/tables/admin-permissions';
import { Event } from '../schema/tables/events';

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

  async updatePermissions(newPermissions: PermissionType[]): Promise<PermissionType[]> {
    const adminIdResult = await this.getAdminIdQuery().executeTakeFirst();
    if (!adminIdResult) throw new Error(`Admin not found`);

    const currentPermissions = await this.getPermissions();
    const permissionsToRemove = currentPermissions.filter(p => !newPermissions.includes(p));
    const permissionsToAdd = newPermissions.filter(p => !currentPermissions.includes(p));

    if (permissionsToRemove.length > 0) {
      await this.db
        .deleteFrom('admin_permissions')
        .where('admin_id', '=', adminIdResult.id)
        .where('permission', 'in', permissionsToRemove)
        .execute();
    }

    if (permissionsToAdd.length > 0) {
      await this.db
        .insertInto('admin_permissions')
        .values(
          permissionsToAdd.map(permission => ({
            admin_id: adminIdResult.id,
            permission: permission
          }))
        )
        .execute();
    }

    return await this.getPermissions();
  }

  async updateLastLogin(): Promise<void> {
    await this.db
      .updateTable('admins')
      .set({ last_login: new Date() })
      .where('id', '=', this.getAdminIdQuery())
      .execute();
  }

  async getEvents(): Promise<Event[]> {
    const adminIdResult = await this.getAdminIdQuery().executeTakeFirst();
    if (!adminIdResult) return [];

    const events = await this.db
      .selectFrom('admin_events')
      .innerJoin('events', 'admin_events.event_id', 'events.id')
      .selectAll('events')
      .where('admin_events.admin_id', '=', adminIdResult.id)
      .execute();

    return events;
  }

  async isAssignedToEvent(eventId: string): Promise<boolean> {
    const adminIdResult = await this.getAdminIdQuery().executeTakeFirst();
    if (!adminIdResult) return false;

    const result = await this.db
      .selectFrom('admin_events')
      .select('admin_id')
      .where('admin_id', '=', adminIdResult.id)
      .where('event_id', '=', eventId)
      .executeTakeFirst();
    return !!result;
  }
}

class AdminsSelector {
  constructor(
    private db: Kysely<KyselyDatabaseSchema>,
    private eventId: string
  ) {}

  async getAll(): Promise<Admin[]> {
    return await this.db
      .selectFrom('admin_events')
      .innerJoin('admins', 'admin_events.admin_id', 'admins.id')
      .selectAll('admins')
      .where('admin_events.event_id', '=', this.eventId)
      .orderBy('admins.username', 'asc')
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

  byEventId(eventId: string): AdminsSelector {
    return new AdminsSelector(this.db, eventId);
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
