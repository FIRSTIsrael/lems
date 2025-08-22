import { AdminsTable } from './tables/admins';
import { AdminPermissionTable } from './tables/admin-permissions';
import { AdminEventsTable } from './tables/admin-events';
import { SeasonsTable } from './tables/seasons';
import { EventsTable } from './tables/events';
import { DivisionsTable } from './tables/divisions';
import { EventUsersTable } from './tables/event-users';
import { EventUserDivisionsTable } from './tables/event-user-divisions';
import { TeamsTable } from './tables/teams';
import { TeamDivisionsTable } from './tables/team-divisions';
import { TeamDivisionNotificationsTable } from './tables/team-division-notifications';
import { JudgingRoomsTable } from './tables/judging-rooms';
import { JudgingSessionsTable } from './tables/judging-sessions';
import { RobotGameTablesTable } from './tables/robot-game-tables';
import { RobotGameMatchesTable } from './tables/robot-game-matches';
import { RobotGameMatchParticipantsTable } from './tables/robot-game-match-participants';

export interface KyselyDatabaseSchema {
  admins: AdminsTable;
  admin_permissions: AdminPermissionTable;
  admin_events: AdminEventsTable;
  seasons: SeasonsTable;
  events: EventsTable;
  divisions: DivisionsTable;
  event_users: EventUsersTable;
  event_user_divisions: EventUserDivisionsTable;
  teams: TeamsTable;
  team_divisions: TeamDivisionsTable;
  team_division_notifications: TeamDivisionNotificationsTable;
  judging_rooms: JudgingRoomsTable;
  judging_sessions: JudgingSessionsTable;
  robot_game_tables: RobotGameTablesTable;
  robot_game_matches: RobotGameMatchesTable;
  robot_game_match_participants: RobotGameMatchParticipantsTable;
}
