import { Kysely } from 'kysely';
import { KyselyDatabaseSchema } from '../schema/kysely';
import { ObjectStorage } from '../object-storage';
import { InsertableTeam, Team } from '../schema/tables/teams';

type TeamSelectorType = { type: 'id'; value: string } | { type: 'number'; value: number };

class TeamSelector {
  constructor(
    private db: Kysely<KyselyDatabaseSchema>,
    private space: ObjectStorage,
    private selector: TeamSelectorType
  ) {}

  private getTeamQuery() {
    const query = this.db.selectFrom('teams').selectAll('teams');
    return query.where(this.selector.type, '=', this.selector.value);
  }

  async get(): Promise<Team | null> {
    const team = await this.getTeamQuery().executeTakeFirst();
    return team || null;
  }

  async updateName(name: string): Promise<Team | null> {
    const team = await this.get();
    if (!team) return null;

    const updatedTeam = await this.db
      .updateTable('teams')
      .set({ name })
      .where('id', '=', team.id)
      .returningAll()
      .executeTakeFirst();

    return updatedTeam || null;
  }

  async updateLogo(logo: Buffer): Promise<Team | null> {
    const team = await this.get();
    if (!team) return null;

    const logoUrl = await this.space
      .putObject(`teams/${team.id}/logo.jpg`, logo, 'image/jpeg')
      .catch(error => {
        console.error('Error uploading team logo:', error);
        throw new Error('Failed to upload team logo');
      });

    const updatedTeam = await this.db
      .updateTable('teams')
      .set({ logo_url: logoUrl })
      .where('id', '=', team.id)
      .returningAll()
      .executeTakeFirst();

    return updatedTeam || null;
  }
}

export class TeamsRepository {
  constructor(
    private db: Kysely<KyselyDatabaseSchema>,
    private space: ObjectStorage
  ) {}

  byId(id: string): TeamSelector {
    return new TeamSelector(this.db, this.space, { type: 'id', value: id });
  }

  byNumber(number: number): TeamSelector {
    return new TeamSelector(this.db, this.space, {
      type: 'number',
      value: number
    });
  }

  async getAll(): Promise<Team[]> {
    const teams = await this.db
      .selectFrom('teams')
      .selectAll('teams')
      .orderBy('number', 'asc')
      .execute();
    return teams;
  }

  async create(team: InsertableTeam): Promise<Team> {
    const [createdTeam] = await this.db.insertInto('teams').values(team).returningAll().execute();
    return createdTeam;
  }

  async createMany(teams: InsertableTeam[]): Promise<Team[]> {
    const createdTeams = await this.db.insertInto('teams').values(teams).returningAll().execute();
    return createdTeams;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.db.deleteFrom('teams').where('id', '=', id).execute();
    return result.length > 0;
  }
}
