import type {
  Collection,
  Document,
  Filter,
  OptionalUnlessRequiredId,
  UpdateFilter,
  WithId,
} from "mongodb";
import type { ObjectId } from "mongodb";

export class BaseRepository<T extends Document> {
  constructor(protected readonly collection: Collection<T>) {}

  async create(document: Omit<T, "_id">) {
    return this.collection.insertOne(
      document as unknown as OptionalUnlessRequiredId<T>,
    );
  }

  async findById(id: ObjectId): Promise<WithId<T> | null> {
    return this.collection.findOne({ _id: id } as Filter<T>);
  }

  async findOne(filter: Filter<T>): Promise<WithId<T> | null> {
    return this.collection.findOne(filter);
  }

  async findMany(
    filter: Filter<T> = {} as Filter<T>,
  ): Promise<WithId<T>[]> {
    return this.collection.find(filter).toArray();
  }

  async updateById(id: ObjectId, update: UpdateFilter<T>) {
    return this.collection.updateOne(
      { _id: id } as Filter<T>,
      update,
    );
  }

  async count(filter: Filter<T> = {} as Filter<T>) {
    return this.collection.countDocuments(filter);
  }
}