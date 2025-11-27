import type { TransactionalAdapterMongoose } from '@/common/context/adapters/transactional-mongoose.adapter';
import type {
  IDatabaseCreateManyOptions,
  IDatabaseCreateOptions,
  IDatabaseExistOptions,
  IDatabaseFindAllOptions,
  IDatabaseFindOneOptions,
  IDatabaseGetTotalOptions,
  IDatabaseSaveOptions,
  IDatabaseUpdateManyOptions,
  IDatabaseUpdateOneOptions,
  IPaginationOptions,
} from '@/common/database/interfaces/database.interface';
import type { TransactionHost } from '@nestjs-cls/transactional';
import type {
  ClientSession,
  Document,
  FilterQuery,
  Model,
  PipelineStage,
  PopulateOptions,
} from 'mongoose';
import type { DeleteResult } from 'typeorm/driver/mongodb/typings';
import { Logger } from '@nestjs/common';

import { Types } from 'mongoose';

import { DATABASE_DELETED_AT_FIELD_NAME } from '@/common/database/constants/database.constant';
import MongoErrorCode from '@/common/database/enums/mongo-error-code.enum';
import { ERROR_CODES } from '@/common/error/constants/error-code';
import { AppRequestException } from '@/common/error/exceptions/app-request.exception';

/**
 * Abstract class for a repository
 * @template Entity – Object type
 * @template EntityDoc –  Document object type
 * @template {Entity | EntityDoc} T
 *
 * @property {Model<Entity>} _repository - The actual database repository.
 * @property {PopulateOptions | PopulateOptions[]} _joinOnFind - Join options on find.
 */
export abstract class DatabaseMongoObjectIdRepositoryAbstract<Entity, EntityDoc> {
  private logger = new Logger(DatabaseMongoObjectIdRepositoryAbstract.name);

  protected _repository: Model<Entity>;

  protected _joinOnFind?: PopulateOptions | PopulateOptions[];

  protected _txHost?: TransactionHost<TransactionalAdapterMongoose>;

  protected constructor(
    repository: Model<Entity>,
    options?: PopulateOptions | PopulateOptions[],
    txHost?: TransactionHost<TransactionalAdapterMongoose>,
  ) {
    this._repository = repository;
    this._joinOnFind = options;
    this._txHost = txHost;
  }

  private toDotNotation(obj: Record<string, any>, prefix = ''): Record<string, any> {
    return Object.entries(obj).reduce((acc, [key, value]) => {
      const path = prefix ? `${prefix}.${key}` : key;

      if (Types.ObjectId.isValid(value) && value instanceof Types.ObjectId) {
        acc[path] = value;
      } else if (value && typeof value === 'object' && !Array.isArray(value)) {
        Object.assign(acc, this.toDotNotation(value, path));
      } else {
        acc[path] = value;
      }

      return acc;

      return acc;
    }, {});
  }

  /**
   * Saves the specified entity document to the repository.
   *
   * @param {EntityDoc & Document<string>} repository - The repository to save the entity document to.
   * @param {IDatabaseSaveOptions} [options] - Optional parameters for saving the entity document.
   * @returns {Promise<EntityDoc>} - A promise that resolves with the saved entity document.
   */
  public async save(
    repository: EntityDoc & Document,
    options?: IDatabaseSaveOptions,
  ): Promise<EntityDoc> {
    return repository.save({
      ...options,
      ...(options?.skipTransaction ? {} : { session: this._txHost?.tx }),
    });
  }

  /**
   * Apply common options to a query.
   * @private
   * @param {Record<string, any>} query - The query to apply options to.
   * @param {IDatabaseFindOneOptions & IPaginationOptions} options - The options to apply.
   * @returns {void} - Returns nothing.
   */
  private applyCommonOptions<T extends IDatabaseFindOneOptions & IPaginationOptions>(
    query: FilterQuery<EntityDoc>,
    options?: T,
  ): void {
    if (!options) {
      return;
    }

    // 1. Field selection [_id, name, etc.] if `select` is provided.
    if (options.select) {
      query.select(options.select);
    }

    if (options.paging) {
      const { limit, offset } = options.paging;
      if (typeof limit === 'number' && limit > 0) {
        query.limit(limit);
      }

      if (typeof offset === 'number' && offset >= 0) {
        query.skip(offset);
      }
    }

    if (options.sort) {
      query.sort(options.sort);
    }

    // 4. Population of relations: `join` can be boolean or string/array of populations.
    // join: [
    //   {
    //     path: 'author',
    //     select: 'text createdAt',
    //     match: { isSpam: false },
    //   },
    //   {
    //     path: 'comments',
    //     select: 'text createdAt',
    //     match: { isSpam: false },
    //   },
    // ];
    if (options.join) {
      if (options.join === true) {
        // Define `_joinOnFind` in the class with the default population configuration if necessary.
        query.populate(this._joinOnFind);
      } else {
        query.populate(options.join);
      }
    }

    // if (!options?.session || options.session === true) {
    //   // if (options.session) {
    //   // query.session(options.session);
    //   query.session(this._txHost?.tx);
    // }

    // 6. Soft delete: show deleted documents or not, depending on `withDeleted`.
    if (options.withDeleted) {
      // Allows fetching both documents with `deletedAt` defined and not defined.
      query.or([
        { [DATABASE_DELETED_AT_FIELD_NAME]: { $exists: false } },
        { [DATABASE_DELETED_AT_FIELD_NAME]: { $exists: true } },
      ]);
    } else {
      // Excludes deleted documents (those with `deletedAt` defined).
      query.where(DATABASE_DELETED_AT_FIELD_NAME).exists(false);
    }

    // 7. `lean`: only transforms to POJO when requested.
    // Lean is apply by default for better performance
    if (!options?.lean || options.lean === true) {
      query.lean({
        virtuals: true,
        getters: true,
        transform: true,
      });
    }
  }

  hydrate(entity: Entity): EntityDoc {
    return this._repository.hydrate(entity) as EntityDoc;
  }

  /**
   * Finds all entities matching the given filter.
   *
   * @param {Record<string, any>} filter - The filter to apply.
   * @param {IDatabaseFindAllOptions<ClientSession>} options - The options to apply.
   *
   * @return {Promise<[]>} A promise that resolves to an array of entities.
   */
  async findAll(
    filter?: Partial<Record<keyof Entity, unknown>>,
    options?: IDatabaseFindAllOptions<ClientSession>,
  ): Promise<EntityDoc[]> {
    try {
      const query = this._repository.find(filter ?? {});
      this.applyCommonOptions(query, options);

      return (await query.exec()) as EntityDoc[];
    } catch (error) {
      throw new AppRequestException({ ...ERROR_CODES.DATABASE_ERROR, errors: [error] });
    }
  }

  /**
   * Find a single document in the database.
   *
   * @param {Record<string, any>} find - The find query to match the document.
   * @param {IDatabaseFindOneOptions} [options] - The options for the find operation.
   * @return {Promise<T>} - A promise that resolves to the found document.
   */
  async findOne(
    filter: Partial<Record<keyof Entity, unknown>>,
    options?: IDatabaseFindOneOptions,
  ): Promise<EntityDoc> {
    try {
      const query = this._repository.findOne(filter);
      this.applyCommonOptions(query, options);

      return (await query.exec()) as EntityDoc;
    } catch (error) {
      throw new AppRequestException({ ...ERROR_CODES.DATABASE_ERROR, errors: [error] });
    }
  }

  /**
   * Finds a document by its ID.
   *
   * @param {string} _id - The ID of the document.
   * @param {IDatabaseFindOneOptions<ClientSession>} [options] - Optional parameters for the query.
   * @returns {Promise<T>} - A promise that resolves with the found document.
   * @throws {Error} - If an error occurs during the query execution.
   */
  async findOneById(
    _id: string,
    options?: IDatabaseFindOneOptions<ClientSession>,
  ): Promise<EntityDoc> {
    const query = this._repository.findById(new Types.ObjectId(_id));
    this.applyCommonOptions(query, options);

    try {
      return (await query.exec()) as EntityDoc;
    } catch (error) {
      throw new AppRequestException({ ...ERROR_CODES.DATABASE_ERROR, errors: [error] });
    }
  }

  /**
   * Executes a given pipeline of stages and returns an array of raw responses.
   *
   * @param {PipelineStage[]} rawOperation - The pipeline stages to be executed.
   * @throws {TypeError} - If rawOperation is not an array.
   * @returns {Promise<Array<Record<string, any>>>} - The array of raw responses.
   */
  async pipeline<RawResponse, RawQuery = PipelineStage[]>(
    rawOperation: RawQuery,
  ): Promise<RawResponse[]> {
    if (!Array.isArray(rawOperation)) {
      throw new AppRequestException({
        ...ERROR_CODES.DATABASE_ERROR,
        message: 'Pipeline must be an array',
      });
    }

    try {
      // Aggregate return by default plain JS objects(POJOs)  (is like lean) no mongoose documents
      const query = this._repository.aggregate(rawOperation);
      return await query.exec();
    } catch (error) {
      throw new AppRequestException({ ...ERROR_CODES.DATABASE_ERROR, errors: [error] });
    }
  }

  /**
   * Calculates the total number of documents that match the specified query.
   *
   * @param {Record<string, any>} find - The query used to filter the documents. Optional.
   * @param {IDatabaseGetTotalOptions<ClientSession>} options - Additional options to modify the count query. Optional.
   * @returns {Promise<number>} A promise that resolves to the total number of documents.
   * @throws {Error} If an error occurs while executing the count query.
   */
  async getTotal(
    filter: Partial<Record<keyof Entity, unknown>>,
    options?: IDatabaseGetTotalOptions<ClientSession>,
  ): Promise<number> {
    try {
      const query = this._repository.countDocuments(filter);
      this.applyCommonOptions(query, options);

      return await query.exec();
    } catch (error) {
      throw new AppRequestException({ ...ERROR_CODES.DATABASE_ERROR, errors: [error] });
    }
  }

  /**
   * Checks if a document exists in the database based on the given find criteria.
   *
   * @param {Record<string, any>} find - The find criteria for the document.
   * @param {IDatabaseExistOptions<ClientSession>} [options] - Optional options for the exists operation.
   * @returns {Promise<boolean>} - A promise that resolves to a boolean indicating if the document exists.
   */
  async exists(
    filter: Partial<Record<keyof Entity, unknown>>,
    options?: IDatabaseExistOptions<ClientSession>,
  ): Promise<boolean> {
    try {
      // if (options?.excludeId) {
      //   (filter as any)._id = {
      //     $nin: options.excludeId.map((val) => new Types.ObjectId(val)),
      //   };
      // }

      const query = this._repository.exists(filter);
      this.applyCommonOptions(query, options);

      const isResult = await query.exec();

      return Boolean(isResult);
    } catch (error) {
      throw new AppRequestException({ ...ERROR_CODES.DATABASE_ERROR, errors: [error] });
    }
  }

  // ! CREATE
  /**
   * Creates a new document in the database.
   *
   * @template Dto - The type of the document data being created.
   * @param {Dto} data - The data for creating the document.
   * @param {IDatabaseCreateOptions<ClientSession>} [options] - Options for creating the document. Default: undefined.
   * @returns {Promise<HydratedDocument<Dto>>} - The created document.
   */
  async create(
    data: Partial<EntityDoc>,
    options?: IDatabaseCreateOptions<ClientSession>,
  ): Promise<EntityDoc> {
    try {
      // create can no be use with exec because return directly promises
      const query = this._repository.create([data], {
        ...options,
        ...(options?.skipTransaction ? {} : { session: this._txHost?.tx }),
      });

      const [doc] = (await query) as EntityDoc[];

      return doc;
    } catch (error) {
      if (error?.code === MongoErrorCode.DuplicateKey) {
        throw new AppRequestException({ ...ERROR_CODES.DUPLICATE_KEY, errors: [error] });
      }

      throw new AppRequestException({ ...ERROR_CODES.DATABASE_ERROR, errors: [error] });
    }
  }

  /**
   * Creates multiple records in the database.
   *
   * @template Dto - The type of the records being created.
   * @param {Dto[]} data - An array of data representing the records to be created.
   * @param {IDatabaseCreateManyOptions<ClientSession>} [options] - Optional options for creating the records.
   * @returns {Promise<boolean>} - A promise that resolves to a boolean indicating if the records were created successfully.
   * @throws - Throws any error that occurs during the operation.
   */
  async createMany(
    data: Partial<Entity[]>,
    options?: IDatabaseCreateManyOptions<ClientSession>,
  ): Promise<EntityDoc[]> {
    // const dataCreate = data.map((val) => ({ ...val, _id: new Types.ObjectId(val._id as string) }));

    try {
      // insertMany can no be use with exec because return directly promises
      const query = this._repository.insertMany(data, {
        ...options,
        ...(options?.skipTransaction ? {} : { session: this._txHost?.tx }),
      });

      return (await query) as EntityDoc[];
    } catch (error) {
      if (error?.code === MongoErrorCode.DuplicateKey)
        throw new AppRequestException({ ...ERROR_CODES.DUPLICATE_KEY, errors: [error] });

      throw new AppRequestException({ ...ERROR_CODES.DATABASE_ERROR, errors: [error] });
    }
  }

  // ! UPDATE

  /**
   * Updates a single document in the database collection.
   *
   * @template Dto - The type of the data to update.
   *
   * @param {Record<string, any>} filter - The filter to select the document to update.
   * @param {Dto} data - The data to update the document with.
   * @param {IDatabaseUpdateOneOptions<ClientSession>} [options] - The options for the update operation.
   *
   * @returns {Promise<boolean>} - Returns a promise that resolves to a boolean value indicating whether the update was successful or not.
   *
   * @throws {Error} - If an error occurs during the update operation.
   */
  async updateOne(
    filter: Partial<Record<keyof Entity, unknown>>,
    // filter: Partial<Record<keyof Entity, unknown>>,
    // data: Partial<Entity>,
    data: Partial<Record<keyof Entity, unknown>>,
    options?: IDatabaseUpdateOneOptions<ClientSession>,
  ): Promise<EntityDoc> {
    try {
      const dotNotationData = this.toDotNotation(data);

      const query = this._repository.findOneAndUpdate(
        filter,
        { $set: dotNotationData },
        {
          upsert: options?.upsert ?? false,
          returnDocument: options?.returnDocument ?? 'after',
          ...(options?.skipTransaction ? {} : { session: this._txHost?.tx }),
        },
      );

      return (await query.exec()) as EntityDoc;
    } catch (error) {
      if (error?.code === MongoErrorCode.DuplicateKey) {
        throw new AppRequestException({ ...ERROR_CODES.DUPLICATE_KEY, errors: [error] });
      }

      throw new AppRequestException({ ...ERROR_CODES.DATABASE_ERROR, errors: [error] });
    }
  }

  /**
   * Updates multiple documents in the database.
   *
   * @async
   * @template Dto - The data type of the document being updated.
   * @param {Record<string, any>} find - The filter to select the documents to update.
   * @param {Dto} data - The data object containing the fields to update.
   * @param {IDatabaseManyOptions<ClientSession>} [options] - Optional options to customize the update operation.
   * @returns {Promise<boolean>} A promise that resolves to true if the update is successful.
   * @throws {Error} If an error occurs while updating the documents.
   */
  async updateMany(
    filter: Partial<Record<keyof Entity, unknown>>,
    data: Partial<Entity>,
    options?: IDatabaseUpdateManyOptions,
  ): Promise<boolean> {
    try {
      const query = this._repository.updateMany(
        filter,
        { $set: data },
        {
          upsert: options?.upsert ?? false,
        },
      );

      await query.exec();

      return true;
    } catch (error) {
      if (error?.code === MongoErrorCode.DuplicateKey)
        throw new AppRequestException({ ...ERROR_CODES.DUPLICATE_KEY, errors: [error] });

      throw new AppRequestException({ ...ERROR_CODES.DATABASE_ERROR, errors: [error] });
    }
  }

  // ! DELETE
  /**
   * Marks the given repository as deleted by setting the `deletedAt` property to the current date and time.
   * Saves the repository using the specified options.
   *
   * @param {EntityDoc & Document<string> & { deletedAt?: Date }} repository - The repository to mark as deleted.
   * @param {IDatabaseSaveOptions} [options] - The options to be used while saving the repository.
   * @returns {Promise<EntityDoc>} - A promise that resolves to the saved repository.
   */
  async softDelete(
    repository: EntityDoc & Document & { deletedAt?: Date },
    options?: IDatabaseSaveOptions<ClientSession>,
  ): Promise<EntityDoc> {
    try {
      repository.deletedAt = new Date();

      return await repository.save({
        ...options,
        ...(options?.skipTransaction ? {} : { session: this._txHost?.tx }),
      });
    } catch (error) {
      throw new AppRequestException({ ...ERROR_CODES.DATABASE_ERROR, errors: [error] });
    }
  }

  async softDeleteById(id: string, options?: IDatabaseSaveOptions): Promise<EntityDoc> {
    try {
      return await this.updateOne(
        { _id: new Types.ObjectId(id) } as Partial<Record<keyof Entity, unknown>>,
        { deletedAt: new Date() } as unknown as Partial<Entity>,
        { ...options, ...(options?.skipTransaction ? {} : { session: this._txHost?.tx }) },
      );
    } catch (error) {
      throw new AppRequestException({ ...ERROR_CODES.DATABASE_ERROR, errors: [error] });
    }
  }

  /**
   * Deletes a document from the repository.
   *
   * @param {EntityDoc & Document<string>} repository - The repository to delete the document from.
   * @param {IDatabaseSaveOptions} [options] - The options for deletion.
   * @returns {Promise<EntityDoc>} - Resolves with the deleted document.
   */
  async deleteDocument(
    repository: EntityDoc & Document,
    options?: IDatabaseSaveOptions,
  ): Promise<DeleteResult> {
    try {
      const query = this._repository.deleteOne(
        { _id: repository._id },
        {
          ...options,
          ...(options?.skipTransaction ? {} : { session: this._txHost?.tx }),
        },
      );

      return await query.exec();
    } catch (error) {
      throw new AppRequestException({ ...ERROR_CODES.DATABASE_ERROR, errors: [error] });
    }
  }

  /**
   * Deletes a document from the database based on the provided ID.
   *
   * @param id - The ID of the document to delete.
   * @param options - Optional save options.
   * @returns A promise that resolves to a `DeleteResult` object.
   */
  async deleteOneById(id: string, options?: IDatabaseSaveOptions): Promise<DeleteResult> {
    try {
      const query = this._repository.deleteOne(
        { _id: new Types.ObjectId(id) },
        {
          ...options,
          ...(options?.skipTransaction ? {} : { session: this._txHost?.tx }),
        },
      );

      return await query.exec();
    } catch (error) {
      throw new AppRequestException({ ...ERROR_CODES.DATABASE_ERROR, errors: [error] });
    }
  }

  /**
   * Deletes a document from the database based on the filter provided
   *
   * @param id - The ID of the document to delete.
   * @param options - Optional save options.
   * @returns A promise that resolves to a `DeleteResult` object.
   */
  async deleteOne(
    filter: Partial<Record<keyof Entity, unknown>>,
    options?: IDatabaseSaveOptions,
  ): Promise<DeleteResult> {
    try {
      const query = this._repository.deleteOne(filter, {
        ...options,
        ...(options?.skipTransaction ? {} : { session: this._txHost?.tx }),
      });

      return await query.exec();
    } catch (error) {
      throw new AppRequestException({ ...ERROR_CODES.DATABASE_ERROR, errors: [error] });
    }
  }

  // /**
  //  * Performs a pipeline search operation using the given raw operation.
  //  *
  //  * @param {PipelineStage[]} rawOperation - The raw query for pipeline stages.
  //  * @throws {TypeError} If the rawOperation is not an array.
  //  * @return {Promise<Array<Record<string, any>>>} The result of the pipeline search operation as a Promise of RawResponse.
  //  */
  // async pipelineSearch<RawResponse, RawQuery = PipelineStage[]>(
  //   rawOperation: RawQuery,
  // ): Promise<RawResponse> {
  //   if (!Array.isArray(rawOperation)) {
  //     throw new AppRequestException({ ...ERROR_CODES.DATABASE_ERROR, message: 'Must be an array' });
  //   }

  //   try {
  //     const result = (await this._repository.aggregate(rawOperation)) as any;
  //     return result.map((doc) => this._repository.hydrate(doc)) as RawResponse;
  //   } catch (error) {
  //     throw new AppRequestException({ ...ERROR_CODES.DATABASE_ERROR, errors: [error] });
  //   }
  // }

  // async findOneAndUpdate(
  //   filter: Partial<Record<keyof Entity, unknown>>,
  //   data: Partial<Entity>,
  //   options?: IDatabaseUpdateOneOptions<ClientSession>,
  // ): Promise<EntityDoc> {
  //   const update = this._repository.findOneAndUpdate(
  //     filter,
  //     { $set: data },
  //     { upsert: options?.upsert ?? false, returnDocument: options?.returnDocument ?? 'after' },
  //   );
  //   this.applyCommonOptions(update, options);

  //   try {
  //     return (await update) as EntityDoc;
  //   } catch (error) {
  //     throw new AppRequestException({ ...ERROR_CODES.DATABASE_ERROR, errors: [error] });
  //   }
  // }

  /**
   * Applies a query filter with the option to include deleted documents.
   *
   * @template T - The type of documents being queried.
   * @param {Query<T, T>} query - The query object to apply the filter on.
   * @param {boolean} [withDeleted] - If set to true, includes deleted documents in the results.
   * @returns {Query<T, T>} The modified query object with the applied filter.
   */
  // private applyWithDeleted<T>(query: Query<T, T>, withDeleted?: boolean): Query<T, T> {
  //   if (withDeleted) {
  //     return query.or([
  //       { [DATABASE_DELETED_AT_FIELD_NAME]: { $exists: false } },
  //       { [DATABASE_DELETED_AT_FIELD_NAME]: { $exists: true } },
  //     ]);
  //   }

  //   return query.where(DATABASE_DELETED_AT_FIELD_NAME).exists(false);
  // }

  // /**
  //  * Find all distinct values of a specific field in the database.
  //  *
  //  * @param {string} fieldDistinct - The field to find distinct values for.
  //  * @param {Record<string, any>} [find] - Optional query criteria for finding documents.
  //  * @param {IDatabaseFindAllOptions<ClientSession>} [options] - Optional options for the find operation.
  //  * @returns {Promise<Array<T>>} - A promise that resolves with an array of distinct values.
  //  */
  // async findAllDistinct<T = Entity>(
  //   fieldDistinct: string,
  //   find?: Record<string, any>,
  //   options?: IDatabaseFindAllOptions<ClientSession>,
  // ): Promise<T[]> {
  //   const pipeline: PipelineStage[] = [
  //     { $match: find || {} },
  //     { $group: { _id: `$${fieldDistinct}` } },
  //   ];

  //   if (options?.withDeleted) {
  //     pipeline.unshift({
  //       $match: {
  //         $or: [
  //           { [DATABASE_DELETED_AT_FIELD_NAME]: { $exists: false } },
  //           { [DATABASE_DELETED_AT_FIELD_NAME]: { $exists: true } },
  //         ],
  //       },
  //     });
  //   } else {
  //     pipeline.unshift({
  //       $match: {
  //         [DATABASE_DELETED_AT_FIELD_NAME]: { $exists: false },
  //       },
  //     });
  //   }

  //   const aggregation = this._repository.aggregate<{ _id: T }>(pipeline);
  //   this.applyCommonOptions(aggregation, options);

  //   const result = await aggregation.exec();

  //   return result.map((doc) => doc._id);
  // }

  // /**
  //  * Restores a deleted entity by setting the 'deletedAt' property to undefined
  //  * and saving the repository document.
  //  *
  //  * @param {EntityDoc & Document<string> & { deletedAt?: Date }} repository - The repository document to restore.
  //  * @param {IDatabaseSaveOptions} [options] - Optional save options.
  //  * @returns {Promise<EntityDoc>} A promise that resolves to the restored repository document.
  //  */
  // async restore(
  //   repository: EntityDoc & Document & { deletedAt?: Date },
  //   options?: IDatabaseSaveOptions,
  // ): Promise<EntityDoc> {
  //   repository.deletedAt = undefined;

  //   return repository.save(options);
  // }

  // /**
  //  * Deletes multiple documents by their IDs
  //  *
  //  * @param {string[]} _id - An array of IDs of the documents to delete
  //  * @param {IDatabaseManyOptions<ClientSession>} [options] - Optional database options
  //  *
  //  * @returns {Promise<boolean>} - A promise that resolves to true if the deletion is successful, otherwise it throws an error
  //  */
  // async deleteManyByIds(
  //   _id: string[],
  //   options?: IDatabaseManyOptions<ClientSession>,
  // ): Promise<boolean> {
  //   const del = this._repository.deleteMany({
  //     _id: { $in: _id.map((val) => new Types.ObjectId(val)) },
  //   });
  //   this.applyCommonOptions(del, options);

  //   try {
  //     await del;

  //     return true;
  //   } catch (error) {
  //     this.logger.error(error);

  //     throw error;
  //   }
  // }

  // /**
  //  * Delete multiple documents from the database based on the specified criteria.
  //  *
  //  * @param {Record<string, any>} find - The criteria to find the documents to be deleted.
  //  * @param {IDatabaseManyOptions<ClientSession>} [options] - Additional options for the delete operation. (optional)
  //  * @returns {Promise<boolean>} - A promise that resolves to a boolean indicating whether the deletion was successful.
  //  * @throws {Error} - If an error occurs during the delete operation.
  //  */
  // async deleteMany(
  //   find: Record<string, any>,
  //   options?: IDatabaseManyOptions<ClientSession>,
  // ): Promise<boolean> {
  //   const del = this._repository.deleteMany(find);
  //   this.applyCommonOptions(del, options);

  //   try {
  //     await del;

  //     return true;
  //   } catch (error) {
  //     this.logger.error(error);

  //     throw error;
  //   }
  // }

  // /**
  //  * Find and lock a document in the database.
  //  *
  //  * @param {Record<string, any>} find - The query  to find the document.
  //  * @param {IDatabaseFindOneOptions<ClientSession>} [options] - The options for the find operation.
  //  * @return {Promise} A Promise that resolves with the locked document.
  //  * @throws {Error} If an error occurs while finding and locking the document.
  //  */
  // async findOneAndLock<T = EntityDoc>(
  //   find: Record<string, any>,
  //   options?: IDatabaseFindOneOptions<ClientSession>,
  // ): Promise<T> {
  //   let findOne = this._repository.findOneAndUpdate(find, {
  //     new: true,
  //     useFindAndModify: false,
  //   }) as unknown as Query<T, T>;

  //   findOne = this.applyWithDeleted(findOne, options?.withDeleted);

  //   this.applyCommonOptions(findOne, options);

  //   try {
  //     const result = await findOne.exec();

  //     return result as T;
  //   } catch (error) {
  //     this.logger.error(error);

  //     throw error;
  //   }
  // }

  // /**
  //  * Find and lock a document in the database by its ID.
  //  *
  //  * @param {string} _id - The ID of the document to find and lock.
  //  * @param {IDatabaseFindOneOptions<ClientSession>} [options] - Optional options for the find and lock operation.
  //  *
  //  * @returns {Promise<T>} - A promise that resolves to the found and locked document.
  //  *
  //  * @throws {Error} - If an error occurs while finding and locking the document.
  //  */
  // async findOneByIdAndLock<T = EntityDoc>(
  //   _id: string,
  //   options?: IDatabaseFindOneOptions<ClientSession>,
  // ): Promise<T> {
  //   let findOne = this._repository.findByIdAndUpdate(new Types.ObjectId(_id), {
  //     new: true,
  //     useFindAndModify: false,
  //   }) as unknown as Query<T, T>;

  //   findOne = this.applyWithDeleted(findOne, options?.withDeleted);

  //   this.applyCommonOptions(findOne, options);

  //   try {
  //     const result = await findOne.exec();

  //     return result as T;
  //   } catch (error) {
  //     this.logger.error(error);

  //     throw error;
  //   }
  // }

  // /**
  //  * Marks multiple documents as soft deleted by their ids.
  //  *
  //  * @param {string[]} _id - An array of ids of the documents to be marked as soft deleted.
  //  * @param {IDatabaseSoftDeleteManyOptions<ClientSession>} [options] - Optional options for soft delete operation.
  //  *
  //  * @returns {Promise<boolean>} - A promise that resolves to true if the soft delete operation is successful,
  //  *     or rejects with an error if the operation fails.
  //  */
  // async softDeleteManyByIds(
  //   _id: string[],
  //   options?: IDatabaseSoftDeleteManyOptions<ClientSession>,
  // ): Promise<boolean> {
  //   const softDel = this._repository
  //     .updateMany(
  //       { _id: { $in: _id.map((val) => new Types.ObjectId(val)) } },
  //       { $set: { deletedAt: new Date() } },
  //     )
  //     .where(DATABASE_DELETED_AT_FIELD_NAME)
  //     .exists(false);
  //   this.applyCommonOptions(softDel, options);

  //   try {
  //     await softDel;

  //     return true;
  //   } catch (error) {
  //     this.logger.error(error);

  //     throw error;
  //   }
  // }

  // /**
  //  * Soft deletes multiple documents in the database.
  //  *
  //  * @param {Record<string, any>} find - The search criteria for documents to be deleted.
  //  * @param {IDatabaseSoftDeleteManyOptions<ClientSession>} [options] - Options for the soft delete operation.
  //  * @returns {Promise<boolean>} - A promise that resolves to true if the soft delete operation is successful.
  //  * @throws {Error} - An error that occurred during the soft delete operation.
  //  */
  // async softDeleteMany(
  //   find: Record<string, any>,
  //   options?: IDatabaseSoftDeleteManyOptions<ClientSession>,
  // ): Promise<boolean> {
  //   const softDel = this._repository
  //     .updateMany(find, { $set: { deletedAt: new Date() } })
  //     .where(DATABASE_DELETED_AT_FIELD_NAME)
  //     .exists(false);
  //   this.applyCommonOptions(softDel, options);

  //   try {
  //     await softDel;

  //     return true;
  //   } catch (error) {
  //     this.logger.error(error);

  //     throw error;
  //   }
  // }

  // /**
  //  * Restores multiple documents by their IDs.
  //  *
  //  * @param {string[]} _id - The IDs of the documents to be restored.
  //  * @param {IDatabaseRestoreManyOptions<ClientSession>} [options] - The options for restoring the documents.
  //  * @returns {Promise<boolean>} - A promise that resolves to true if the restore operation was successful, or rejects with an error if an error occurred.
  //  */
  // async restoreManyByIds(
  //   _id: string[],
  //   options?: IDatabaseRestoreManyOptions<ClientSession>,
  // ): Promise<boolean> {
  //   const rest = this._repository
  //     .updateMany(
  //       { _id: { $in: _id.map((val) => new Types.ObjectId(val)) } },
  //       { $set: { deletedAt: undefined } },
  //     )
  //     .where(DATABASE_DELETED_AT_FIELD_NAME)
  //     .exists(true);
  //   this.applyCommonOptions(rest, options);

  //   try {
  //     await rest;

  //     return true;
  //   } catch (error) {
  //     this.logger.error(error);

  //     throw error;
  //   }
  // }

  // /**
  //  * Restores multiple records in the database.
  //  *
  //  * @param {Record<string, any>} find - The query object to find the records to restore.
  //  * @param {IDatabaseRestoreManyOptions<ClientSession>} [options] - The options for the database restore operation.
  //  * @returns {Promise<boolean>} - A promise that resolves to a boolean indicating whether the restore operation was successful.
  //  * @throws - Any error that occurs during the restore operation.
  //  */
  // async restoreMany(
  //   find: Record<string, any>,
  //   options?: IDatabaseRestoreManyOptions<ClientSession>,
  // ): Promise<boolean> {
  //   const rest = this._repository
  //     .updateMany(find, { $set: { deletedAt: undefined } })
  //     .where(DATABASE_DELETED_AT_FIELD_NAME)
  //     .exists(true);
  //   this.applyCommonOptions(rest, options);

  //   try {
  //     await rest;

  //     return true;
  //   } catch (error) {
  //     this.logger.error(error);

  //     throw error;
  //   }
  // }

  // /**
  //  * Updates multiple raw documents in the database based on the specified conditions.
  //  *
  //  * @param {Record<string, any>} find - The conditions to match documents for updating.
  //  * @param {UpdateWithAggregationPipeline | UpdateQuery<Entity>} data - The update data to apply to the matched documents.
  //  * @param {IDatabaseManyOptions<ClientSession>} [options] - Optional options for the update operation.
  //  * @returns {Promise<boolean>} - A promise that resolves to true if the update operation is successful.
  //  * @throws {Error} - If an error occurs during the update operation.
  //  */
  // async updateManyRaw(
  //   find: Record<string, any>,
  //   data: UpdateWithAggregationPipeline | UpdateQuery<Entity>,
  //   options?: IDatabaseManyOptions<ClientSession>,
  // ): Promise<boolean> {
  //   const update = this._repository
  //     .updateMany(find, data)
  //     .where(DATABASE_DELETED_AT_FIELD_NAME)
  //     .exists(false);
  //   this.applyCommonOptions(update, options);

  //   try {
  //     await update;

  //     return true;
  //   } catch (error) {
  //     this.logger.error(error);

  //     throw error;
  //   }
  // }

  // /**
  //  * Executes a raw database operation using the provided pipeline.
  //  *
  //  * @template RawResponse The type of the raw database operation response.
  //  * @template RawQuery The type of the raw database operation query. Defaults to PipelineStage[].
  //  * @param {RawQuery} rawOperation The raw database operation pipeline.
  //  * @param {IDatabaseRawOptions} [options] Optional options for the raw operation.
  //  * @returns {Promise<RawResponse[]>} A promise that resolves to the raw operation response.
  //  * @throws {TypeError} If rawOperation is not an array.
  //  */
  // async raw<RawResponse, RawQuery = PipelineStage[]>(
  //   rawOperation: RawQuery,
  //   options?: IDatabaseRawOptions,
  // ): Promise<RawResponse[]> {
  //   if (!Array.isArray(rawOperation)) {
  //     throw new AppRequestException({ ...ERROR_CODES.DATABASE_ERROR, message: 'Must be an array' });
  //   }

  //   const pipeline: PipelineStage[] = rawOperation;

  //   if (options?.withDeleted) {
  //     pipeline.push({
  //       $match: {
  //         $or: [
  //           { [DATABASE_DELETED_AT_FIELD_NAME]: { $exists: false } },
  //           { [DATABASE_DELETED_AT_FIELD_NAME]: { $exists: true } },
  //         ],
  //       },
  //     });
  //   } else {
  //     pipeline.push({ $match: { [DATABASE_DELETED_AT_FIELD_NAME]: { $exists: false } } });
  //   }

  //   const aggregate = this._repository.aggregate<RawResponse>(pipeline);
  //   this.applyCommonOptions(aggregate, options);

  //   return aggregate;
  // }

  // /**
  //  * Returns the model.
  //  *
  //  * @returns {Promise<Model<Entity>>} A promise that resolves with the model.
  //  */
  // async model(): Promise<Model<Entity>> {
  //   return this._repository;
  // }
}
