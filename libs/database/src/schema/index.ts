import { AdminsTable } from './tables/admins';
import { AdminPermissionTable } from './tables/admin-permissions';
import { SeasonsTable } from './tables/seasons';
import { EventsTable } from './tables/events';
import { DivisionsTable } from './tables/divisions';
import { EventUsersTable } from './tables/event-users';
import { EventUserDivisionsTable } from './tables/event-user-divisions';

export interface DatabaseSchema {
  admins: AdminsTable;
  admin_permissions: AdminPermissionTable;
  seasons: SeasonsTable;
  events: EventsTable;
  divisions: DivisionsTable;
  event_users: EventUsersTable;
  event_user_divisions: EventUserDivisionsTable;
}
