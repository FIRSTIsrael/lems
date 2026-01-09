import { Kysely } from 'kysely';
import { KyselyDatabaseSchema } from '../schema/kysely';
import { ObjectStorage } from '../object-storage';
import { InsertableTeam, Team, UpdateableTeam } from '../schema/tables/teams';

type TeamSelectorType = { type: 'id'; value: string } | { type: 'slug'; value: string };

class TeamSelector {
  constructor(
    private db: Kysely<KyselyDatabaseSchema>,
    private space: ObjectStorage,
    private selector: TeamSelectorType
  ) {}

  private getTeamQuery() {
    const query = this.db.selectFrom('teams').selectAll('teams');

    if (this.selector.type === 'id') {
      return query.where('id', '=', this.selector.value);
    } else if (this.selector.type === 'slug') {
      const [region, numberStr] = this.selector.value.split('-');
      const number = parseInt(numberStr);
      return query.where('number', '=', number).where('region', '=', region);
    }

    return query;
  }

  async get(): Promise<Team | null> {
    const team = await this.getTeamQuery().executeTakeFirst();
    return team || null;
  }

  async updateName(name: string): Promise<Team | null> {
    const team = await this.getTeamQuery().executeTakeFirst();
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
      .where('id', '=', team.id)
      .returningAll()
      .executeTakeFirst();

    return updatedTeam || null;
  }

  async delete(): Promise<boolean | null> {
    const team = await this.getTeamQuery().executeTakeFirst();
    if (!team) return null;

    const result = await this.db.deleteFrom('teams').where('id', '=', team.id).execute();
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
      .where('id', '=', team.id)
      .returningAll()
      .executeTakeFirst();
    return updatedTeam || null;
  }

  /**
   * Checks if the team is registered in the given event.
   * Returns the division ID the team is registered to, otherwise null.
   */
  async isInEvent(eventId: string): Promise<string | null> {
    let id: string;
    if (this.selector.type === 'id') {
      id = this.selector.value;
    } else {
      const team = await this.getTeamQuery().executeTakeFirst();
      if (!team) return null;
      id = team.id;
    }

    const record = await this.db
      .selectFrom('team_divisions')
      .innerJoin('divisions', 'team_divisions.division_id', 'divisions.id')
      .selectAll()
      .where('team_divisions.team_id', '=', id)
      .where('divisions.event_id', '=', eventId)
      .executeTakeFirst();

    return record ? record.division_id : null;
  }

  async isInDivision(divisionId: string): Promise<boolean> {
    let id: string;
    if (this.selector.type === 'id') {
      id = this.selector.value;
    } else {
      const team = await this.getTeamQuery().executeTakeFirst();
      if (!team) return false;
      id = team.id;
    }

    const record = await this.db
      .selectFrom('team_divisions')
      .selectAll()
      .where('team_id', '=', id)
      .where('division_id', '=', divisionId)
      .executeTakeFirst();
    return !!record;
  }
}

class TeamsSelector {
  constructor(
    private db: Kysely<KyselyDatabaseSchema>,
    private space: ObjectStorage,
    private divisionId: string
  ) {}

  async getAll(): Promise<Team[]> {
    return await this.db
      .selectFrom('team_divisions')
      .innerJoin('teams', 'teams.id', 'team_divisions.team_id')
      .select([
        'teams.pk',
        'teams.id',
        'teams.name',
        'teams.number',
        'teams.region',
        'teams.affiliation',
        'teams.city',
        'teams.coordinates',
        'teams.logo_url'
      ])
      .where('team_divisions.division_id', '=', this.divisionId)
      .orderBy('teams.number', 'asc')
      .execute();
  }

  async deleteAll(): Promise<number> {
    const teamIds = await this.db
      .selectFrom('team_divisions')
      .select('team_id')
      .where('division_id', '=', this.divisionId)
      .execute();

    if (teamIds.length === 0) {
      return 0;
    }

    const teamIdValues = teamIds.map(t => t.team_id);

    await this.db.deleteFrom('team_divisions').where('division_id', '=', this.divisionId).execute();
    const result = await this.db.deleteFrom('teams').where('id', 'in', teamIdValues).execute();

    return result.length;
  }
}

export class TeamsRepository {
  private readonly TEAMS_PER_PAGE = 200;

  constructor(
    private db: Kysely<KyselyDatabaseSchema>,
    private space: ObjectStorage
  ) {}

  byId(id: string): TeamSelector {
    return new TeamSelector(this.db, this.space, { type: 'id', value: id });
  }

  bySlug(slug: string): TeamSelector {
    return new TeamSelector(this.db, this.space, { type: 'slug', value: slug });
  }

  byDivisionId(divisionId: string): TeamsSelector {
    return new TeamsSelector(this.db, this.space, divisionId);
  }

  async getAll(): Promise<Team[]> {
    const teams = await this.db
      .selectFrom('teams')
      .selectAll('teams')
      .orderBy('number', 'asc')
      .execute();
    return teams;
  }

  async getPage(page: number): Promise<Team[]> {
    const teams = await this.db
      .selectFrom('teams')
      .selectAll('teams')
      .orderBy('number', 'asc')
      .offset((page - 1) * this.TEAMS_PER_PAGE)
      .limit(this.TEAMS_PER_PAGE)
      .execute();
    return teams;
  }

  async numberOfPages(): Promise<number> {
    const count = await this.db.selectFrom('teams').select('id').execute();
    return Math.ceil(count.length / this.TEAMS_PER_PAGE);
  }

  async search(searchTerm: string, limit: number): Promise<Team[]> {
    const teams = await this.db
      .selectFrom('teams')
      .selectAll()
      .where(eb =>
        eb.or([
          eb('name', 'ilike', `%${searchTerm}%`),
          eb('number', '=', parseInt(searchTerm) || -1),
          eb('affiliation', 'ilike', `%${searchTerm}%`),
          eb('city', 'ilike', `%${searchTerm}%`)
        ])
      )
      .orderBy(
        eb =>
          eb
            .case()
            .when('name', 'ilike', searchTerm)
            .then(100)
            .when('number', '=', parseInt(searchTerm) || -1)
            .then(95)
            .when('name', 'ilike', `${searchTerm}%`)
            .then(80)
            .else(50)
            .end(),
        'desc'
      )
      .limit(limit)
      .execute();

    return teams;
  }

  async getAllWithActiveStatus(): Promise<Array<Team & { active: boolean }>> {
    const currentSeason = await this.db
      .selectFrom('seasons')
      .select('id')
      .where('start_date', '<=', new Date())
      .where('end_date', '>=', new Date())
      .executeTakeFirst();

    if (!currentSeason) {
      const teams = await this.getAll();
      return teams.map(team => ({ ...team, active: false }));
    }

    const activeTeamIds = await this.db
      .selectFrom('team_divisions')
      .innerJoin('divisions', 'team_divisions.division_id', 'divisions.id')
      .innerJoin('events', 'divisions.event_id', 'events.id')
      .select('team_divisions.team_id')
      .where('events.season_id', '=', currentSeason.id)
      .execute();

    const activeTeamIdSet = new Set(activeTeamIds.map(t => t.team_id));

    const teams = await this.getAll();
    return teams.map(team => ({
      ...team,
      active: activeTeamIdSet.has(team.id)
    }));
  }

  async create(team: InsertableTeam): Promise<Team> {
    const [createdTeam] = await this.db.insertInto('teams').values(team).returningAll().execute();
    return createdTeam;
  }

  async getAllUnregistered(): Promise<Team[]> {
    const teams = await this.db
      .selectFrom('teams')
      .leftJoin('team_divisions', 'teams.id', 'team_divisions.team_id')
      .selectAll('teams')
      .where('team_divisions.team_id', 'is', null)
      .orderBy('teams.number', 'asc')
      .execute();
    return teams;
  }

  async createMany(teams: InsertableTeam[]): Promise<Team[]> {
    const createdTeams = await this.db.insertInto('teams').values(teams).returningAll().execute();
    return createdTeams;
  }

  async upsertMany(teams: InsertableTeam[]): Promise<{ created: Team[]; updated: Team[] }> {
    if (teams.length === 0) {
      return { created: [], updated: [] };
    }

    const teamsWithRegion = teams.filter(
      team => team.number !== undefined && team.region !== undefined
    );

    if (teamsWithRegion.length === 0) {
      return { created: [], updated: [] };
    }

    const existingTeams = await this.db
      .selectFrom('teams')
      .selectAll()
      .where(eb => {
        const conditions = teamsWithRegion.map(team =>
          eb.and([
            eb('number', '=', team.number as number),
            eb('region', '=', team.region as string)
          ])
        );
        return eb.or(conditions);
      })
      .execute();

    const existingTeamSet = new Set(existingTeams.map(team => `${team.number}-${team.region}`));

    const teamsToCreate = teamsWithRegion.filter(
      team => !existingTeamSet.has(`${team.number}-${team.region}`)
    );
    const teamsToUpdate = teamsWithRegion.filter(team =>
      existingTeamSet.has(`${team.number}-${team.region}`)
    );

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
      if (teamData.number === undefined || teamData.region === undefined) continue;

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
          .where('region', '=', teamData.region)
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
