
import type {
  Collection,
  Document,
  Filter,
  OptionalUnlessRequiredId,
  UpdateFilter,
} from "mongodb";

import type { ObjectId } from "mongodb";

export class BaseRepository<T extends Document> {
  constructor(
    protected readonly collection: Collection<T>
  ) {}

  async create(document: OptionalUnlessRequiredId<T>) {
    return this.collection.insertOne(document);
  }

  async findById(id: ObjectId) {
    return this.collection.findOne({
      _id: id,
    } as Filter<T>);
  }

  async findOne(filter: Filter<T>) {
    return this.collection.findOne(filter);
  }

  async findMany(filter: Filter<T> = {} as Filter<T>) {
    return this.collection.find(filter).toArray();
  }

  async updateById(
    id: ObjectId,
    update: UpdateFilter<T>
  ) {
    return this.collection.updateOne(
      {
        _id: id,
      } as Filter<T>,
      update
    );
  }

  async count(filter: Filter<T> = {} as Filter<T>) {
    return this.collection.countDocuments(filter);
  }
}
