import { Kysely } from 'kysely';
import { KyselyDatabaseSchema } from '../schema/kysely';
import { ObjectStorage } from '../object-storage';
import { InsertableTeam, Team, UpdateableTeam } from '../schema/tables/teams';

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
    const updatedTeam = await this.db
      .updateTable('teams')
      .set({ name })
      .where(this.selector.type, '=', this.selector.value)
      .returningAll()
      .executeTakeFirst();

    return updatedTeam || null;
  }

  async updateLogo(logo: Buffer): Promise<Team | null> {
    const team = await this.getTeamQuery().executeTakeFirst();
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
      .where(this.selector.type, '=', this.selector.value)
      .returningAll()
      .executeTakeFirst();

    return updatedTeam || null;
  }

  async delete(): Promise<boolean | null> {
    const result = await this.db
      .deleteFrom('teams')
      .where(this.selector.type, '=', this.selector.value)
      .execute();
    return result.length > 0;
  }

  async update(teamData: Partial<UpdateableTeam>): Promise<Team | null> {
    const team = await this.getTeamQuery().executeTakeFirst();
    if (!team) return null;

    const updateData = Object.fromEntries(
      Object.entries(teamData).filter(([, value]) => value !== undefined)
    ) as Partial<UpdateableTeam>;
    if (Object.keys(updateData).length === 0) return team;

    const updatedTeam = await this.db
      .updateTable('teams')
      .set(updateData)
      .where(this.selector.type, '=', this.selector.value)
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

  async upsertMany(teams: InsertableTeam[]): Promise<{ created: Team[]; updated: Team[] }> {
    if (teams.length === 0) {
      return { created: [], updated: [] };
    }

    const teamNumbers = teams.map(team => team.number).filter(num => num !== undefined) as number[];

    const existingTeams = await this.db
      .selectFrom('teams')
      .selectAll()
      .where('number', 'in', teamNumbers)
      .execute();

    const existingTeamNumbers = new Set(existingTeams.map(team => team.number));

    const teamsToCreate = teams.filter(
      team => team.number && !existingTeamNumbers.has(team.number)
    );
    const teamsToUpdate = teams.filter(team => team.number && existingTeamNumbers.has(team.number));

    const created: Team[] = [];
    const updated: Team[] = [];

    if (teamsToCreate.length > 0) {
      const createdTeams = await this.db
        .insertInto('teams')
        .values(teamsToCreate)
        .returningAll()
        .execute();
      created.push(...createdTeams);
    }

    for (const teamData of teamsToUpdate) {
      if (teamData.number === undefined) continue;

      const updateData: Partial<InsertableTeam> = {};

      if (teamData.name !== undefined) updateData.name = teamData.name;
      if (teamData.affiliation !== undefined) updateData.affiliation = teamData.affiliation;
      if (teamData.city !== undefined) updateData.city = teamData.city;
      if (teamData.coordinates !== undefined) updateData.coordinates = teamData.coordinates;
      if (teamData.logo_url !== undefined) updateData.logo_url = teamData.logo_url;

      if (Object.keys(updateData).length > 0) {
        const updatedTeam = await this.db
          .updateTable('teams')
          .set(updateData)
          .where('number', '=', teamData.number)
          .returningAll()
          .executeTakeFirst();

        if (updatedTeam) {
          updated.push(updatedTeam);
        }
      }
    }

    return { created, updated };
  }
}
