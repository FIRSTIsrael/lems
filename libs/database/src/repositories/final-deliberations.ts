import { Db } from 'mongodb';
import { FinalDeliberation, FinalDeliberationStage } from '../schema/documents/final-deliberation';

const COLLECTION_NAME = 'final_deliberations';

export class FinalDeliberationSelector {
  constructor(
    private mongoDb: Db,
    private divisionId: string
  ) {}

  async get(): Promise<FinalDeliberation | null> {
    const deliberation = await this.mongoDb
      .collection<FinalDeliberation>(COLLECTION_NAME)
      .findOne({ divisionId: this.divisionId });
    return deliberation;
  }

  async upsert(updates: Partial<FinalDeliberation>): Promise<FinalDeliberation> {
    const defaultDeliberation: Omit<FinalDeliberation, 'divisionId'> = {
      stage: 'champions',
      status: 'not-started',
      startTime: null,
      completionTime: null,
      awards: {},
      stageData: {}
    };

    const result = await this.mongoDb
      .collection<FinalDeliberation>(COLLECTION_NAME)
      .findOneAndUpdate(
        { divisionId: this.divisionId },
        { $set: { ...defaultDeliberation, ...updates } },
        { upsert: true, returnDocument: 'after' }
      );

    if (!result) {
      throw new Error(`Failed to upsert final deliberation for division ${this.divisionId}`);
    }

    return result;
  }

  async update(updates: Partial<FinalDeliberation>): Promise<FinalDeliberation | null> {
    const result = await this.mongoDb
      .collection<FinalDeliberation>(COLLECTION_NAME)
      .findOneAndUpdate(
        { divisionId: this.divisionId },
        { $set: updates },
        { returnDocument: 'after' }
      );

    return result;
  }

  async delete(): Promise<void> {
    await this.mongoDb
      .collection<FinalDeliberation>(COLLECTION_NAME)
      .deleteOne({ divisionId: this.divisionId });
  }
}

export class FinalDeliberationsRepository {
  constructor(private mongoDb: Db) {}

  async create(divisionId: string): Promise<FinalDeliberation> {
    return this.byDivision(divisionId).upsert({
      divisionId,
      stage: 'champions',
      status: 'not-started',
      startTime: null,
      completionTime: null,
      awards: {},
      stageData: {}
    });
  }

  byDivision(divisionId: string): FinalDeliberationSelector {
    return new FinalDeliberationSelector(this.mongoDb, divisionId);
  }
}
