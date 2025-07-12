import { AdminsTable } from './tables/admins';
import { AdminPermissionTable } from './tables/admin-permissions';
import { AdminEventsTable } from './tables/admin-events';
import { SeasonsTable } from './tables/seasons';
import { EventsTable } from './tables/events';
import { DivisionsTable } from './tables/divisions';
import { EventUsersTable } from './tables/event-users';
import { EventUserDivisionsTable } from './tables/event-user-divisions';
import { TeamAffiliationsTable } from './tables/team-affiliations';
import { TeamsTable } from './tables/teams';
import { TeamDivisionsTable } from './tables/team-divisions';
import { TeamDivisionNotificationsTable } from './tables/team-division-notifications';

export interface DatabaseSchema {
  admins: AdminsTable;
  admin_permissions: AdminPermissionTable;
  admin_events: AdminEventsTable;
  seasons: SeasonsTable;
  events: EventsTable;
  divisions: DivisionsTable;
  event_users: EventUsersTable;
  event_user_divisions: EventUserDivisionsTable;
  team_affiliations: TeamAffiliationsTable;
  teams: TeamsTable;
  team_divisions: TeamDivisionsTable;
  team_division_notifications: TeamDivisionNotificationsTable;
}
