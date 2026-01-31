import { Db, ObjectId } from 'mongodb';
import { Faq } from '../schema/documents/faq';

const COLLECTION_NAME = 'faqs';

interface CreateFaqInput {
  seasonId: string;
  question: string;
  answer: string;
  displayOrder: number;
  createdBy: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

interface UpdateFaqInput {
  question?: string;
  answer?: string;
  displayOrder?: number;
}

class FaqSelector {
  constructor(
    private db: Db,
    private faqId: string
  ) {}

  async get(): Promise<Faq | null> {
    const collection = this.db.collection<Faq>(COLLECTION_NAME);
    const faq = await collection.findOne({ _id: new ObjectId(this.faqId) });
    return faq;
  }

  async update(updates: UpdateFaqInput): Promise<Faq> {
    const collection = this.db.collection<Faq>(COLLECTION_NAME);
    
    const updateDoc: Partial<Faq> = {
      ...updates,
      updatedAt: new Date()
    };

    await collection.updateOne(
      { _id: new ObjectId(this.faqId) },
      { $set: updateDoc }
    );

    const updatedFaq = await this.get();
    if (!updatedFaq) {
      throw new Error('FAQ not found after update');
    }
    return updatedFaq;
  }

  async delete(): Promise<void> {
    const collection = this.db.collection<Faq>(COLLECTION_NAME);
    await collection.deleteOne({ _id: new ObjectId(this.faqId) });
  }
}

class FaqsSelector {
  constructor(
    private db: Db,
    private seasonId?: string
  ) {}

  private getBaseQuery() {
    if (this.seasonId) {
      return { seasonId: this.seasonId };
    }
    return {};
  }

  async getAll(): Promise<Faq[]> {
    const collection = this.db.collection<Faq>(COLLECTION_NAME);
    return await collection
      .find(this.getBaseQuery())
      .sort({ displayOrder: 1 })
      .toArray();
  }

  async search(searchTerm: string): Promise<Faq[]> {
    const collection = this.db.collection<Faq>(COLLECTION_NAME);
    const query = {
      ...this.getBaseQuery(),
      $or: [
        { question: { $regex: searchTerm, $options: 'i' } },
        { answer: { $regex: searchTerm, $options: 'i' } }
      ]
    };
    
    return await collection
      .find(query)
      .sort({ displayOrder: 1 })
      .toArray();
  }
}

export class FaqsRepository {
  constructor(private db: Db) {}

  byId(faqId: string): FaqSelector {
    return new FaqSelector(this.db, faqId);
  }

  bySeason(seasonId: string): FaqsSelector {
    return new FaqsSelector(this.db, seasonId);
  }

  all(): FaqsSelector {
    return new FaqsSelector(this.db);
  }

  async create(input: CreateFaqInput): Promise<Faq> {
    const collection = this.db.collection<Faq>(COLLECTION_NAME);
    
    const faq: Omit<Faq, '_id'> = {
      seasonId: input.seasonId,
      question: input.question,
      answer: input.answer,
      displayOrder: input.displayOrder,
      createdBy: input.createdBy,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await collection.insertOne(faq as Faq);
    const createdFaq = await collection.findOne({ _id: result.insertedId });
    
    if (!createdFaq) {
      throw new Error('FAQ not found after creation');
    }
    return createdFaq;
  }

  async getMaxDisplayOrder(seasonId: string): Promise<number> {
    const collection = this.db.collection<Faq>(COLLECTION_NAME);
    const result = await collection
      .find({ seasonId })
      .sort({ displayOrder: -1 })
      .limit(1)
      .toArray();
    
    return result.length > 0 ? result[0].displayOrder : 0;
  }
}
