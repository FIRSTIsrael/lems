import { Db } from 'mongodb';
import { FinalDeliberation } from '../schema/documents/final-deliberation';

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

  async update(
    updates: Omit<Partial<FinalDeliberation>, 'divisionId'>
  ): Promise<FinalDeliberation | null> {
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
    const document: FinalDeliberation = {
      divisionId,
      stage: 'champions',
      status: 'not-started',
      startTime: null,
      completionTime: null,
      awards: {},
      stageData: {}
    };

    const result = await this.mongoDb
      .collection<FinalDeliberation>(COLLECTION_NAME)
      .insertOne(document);

    if (!result.insertedId) {
      throw new Error(`Failed to create final deliberation for division ${divisionId}`);
    }

    return document;
  }

  byDivision(divisionId: string): FinalDeliberationSelector {
    return new FinalDeliberationSelector(this.mongoDb, divisionId);
  }
}
