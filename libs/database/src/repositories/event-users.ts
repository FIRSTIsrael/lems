import { Kysely, sql } from 'kysely';
import { KyselyDatabaseSchema } from '../schema/kysely';
import { InsertableEventUser, EventUser } from '../schema/tables/event-users';

class EventUserSelector {
  constructor(
    private db: Kysely<KyselyDatabaseSchema>,
    private selector: { type: 'id' | 'role_info'; key?: string; value: string }
  ) {}

  private getEventUserQuery() {
    let query = this.db.selectFrom('event_users').selectAll();

    if (this.selector.type === 'id') {
      query = query.where('id', '=', this.selector.value);
    } else {
      query = query.where(sql`role_info->>${this.selector.key}`, '=', this.selector.value);
    }

    return query;
  }

  async get(): Promise<EventUser | null> {
    const eventUser = await this.getEventUserQuery().executeTakeFirst();
    return eventUser || null;
  }

  async delete(): Promise<void> {
    if (this.selector.type === 'id') {
      await this.db.deleteFrom('event_users').where('id', '=', this.selector.value).execute();
    } else {
      await this.db
        .deleteFrom('event_users')
        .where(sql`role_info->>${this.selector.key}`, '=', this.selector.value)
        .execute();
    }
  }
}

class EventUsersSelector {
  constructor(
    private db: Kysely<KyselyDatabaseSchema>,
    private selector: { type: 'event_id' | 'division_id'; value: string }
  ) {}

  async getAll(): Promise<(EventUser & { divisions: string[] })[]> {
    let query = this.db
      .selectFrom('event_users')
      .leftJoin('event_user_divisions', 'event_user_divisions.user_id', 'event_users.id')
      .leftJoin('divisions', 'divisions.id', 'event_user_divisions.division_id')
      .selectAll('event_users')
      .select('divisions.id as division_id');

    if (this.selector.type === 'event_id') {
      query = query.where('event_users.event_id', '=', this.selector.value);
    } else {
      query = query
        .innerJoin('event_user_divisions as eud_filter', 'eud_filter.user_id', 'event_users.id')
        .where('eud_filter.division_id', '=', this.selector.value);
    }

    const usersWithDivisions = await query
      .orderBy('event_users.role', 'asc')
      .orderBy('event_users.identifier', 'asc')
      .execute();

    const userMap = new Map<string, EventUser & { divisions: string[] }>();

    for (const row of usersWithDivisions) {
      const userId = row.id;

      if (!userMap.has(userId)) {
        userMap.set(userId, {
          pk: row.pk,
          id: row.id,
          event_id: row.event_id,
          role: row.role,
          identifier: row.identifier,
          role_info: row.role_info,
          password: row.password,
          divisions: []
        });
      }

      if (row.division_id) {
        userMap.get(userId)!.divisions.push(row.division_id);
      }
    }

    return Array.from(userMap.values());
  }
}

export class EventUsersRepository {
  constructor(private db: Kysely<KyselyDatabaseSchema>) {}

  byEventId(eventId: string): EventUsersSelector {
    return new EventUsersSelector(this.db, { type: 'event_id', value: eventId });
  }

  byDivisionId(divisionId: string): EventUsersSelector {
    return new EventUsersSelector(this.db, { type: 'division_id', value: divisionId });
  }

  byId(id: string): EventUserSelector {
    return new EventUserSelector(this.db, { type: 'id', value: id });
  }

  byRoleInfo(key: 'roomId' | 'tableId', value: string): EventUserSelector {
    return new EventUserSelector(this.db, { type: 'role_info', key, value });
  }

  async create(eventUser: InsertableEventUser): Promise<EventUser> {
    const [createdEventUser] = await this.db
      .insertInto('event_users')
      .values(eventUser)
      .returningAll()
      .execute();
    return createdEventUser;
  }

  async createMany(eventUsers: InsertableEventUser[]): Promise<EventUser[]> {
    if (eventUsers.length === 0) {
      return [];
    }

    const createdUsers = await this.db
      .insertInto('event_users')
      .values(eventUsers)
      .returningAll()
      .execute();

    return createdUsers;
  }

  async delete(userId: string): Promise<boolean> {
    const result = await this.db.deleteFrom('event_users').where('id', '=', userId).execute();
    return result.length > 0;
  }

  async assignUserToDivisions(userId: string, divisionIds: string[]): Promise<void> {
    // First remove existing assignments
    await this.db.deleteFrom('event_user_divisions').where('user_id', '=', userId).execute();

    // Add new assignments
    if (divisionIds.length > 0) {
      const assignments = divisionIds.map(divisionId => ({
        user_id: userId,
        division_id: divisionId
      }));

      await this.db.insertInto('event_user_divisions').values(assignments).execute();
    }
  }
}
