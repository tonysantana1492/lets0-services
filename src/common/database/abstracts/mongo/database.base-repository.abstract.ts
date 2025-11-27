import type {
  IDatabaseCreateManyOptions,
  IDatabaseCreateOptions,
  IDatabaseExistOptions,
  IDatabaseFindAllOptions,
  IDatabaseFindOneOptions,
  IDatabaseGetTotalOptions,
  IDatabaseManyOptions,
  IDatabaseRawOptions,
  IDatabaseRestoreManyOptions,
  IDatabaseSaveOptions,
  IDatabaseSoftDeleteManyOptions,
  IDatabaseUpdateOneOptions,
} from '@/common/database/interfaces/database.interface';
import type { ClientSession, UpdateQuery, UpdateWithAggregationPipeline } from 'mongoose';
import type { DeleteResult } from 'typeorm/driver/mongodb/typings';

export abstract class DatabaseBaseRepositoryAbstract<Entity, EntityDoc> {
  abstract findAll<T = EntityDoc>(
    find?: Record<string, any>,
    options?: IDatabaseFindAllOptions<any>,
  ): Promise<T[]>;

  abstract findAllDistinct<T = EntityDoc>(
    fieldDistinct: string,
    find?: Record<string, any>,
    options?: IDatabaseFindAllOptions<any>,
  ): Promise<T[]>;

  abstract findOne(
    find: Partial<EntityDoc>,
    options?: IDatabaseFindOneOptions<any>,
  ): Promise<EntityDoc>;

  abstract findOneById(_id: string, options?: IDatabaseFindOneOptions<any>): Promise<Entity>;

  abstract findOneAndLock<T = EntityDoc>(
    find: Record<string, any>,
    options?: IDatabaseFindOneOptions<any>,
  ): Promise<T>;

  abstract findOneByIdAndLock<T = EntityDoc>(
    _id: string,
    options?: IDatabaseFindOneOptions<any>,
  ): Promise<T>;

  abstract getTotal(
    find?: Record<string, any>,
    options?: IDatabaseGetTotalOptions<any>,
  ): Promise<number>;

  abstract exists(
    find: Record<string, any>,
    options?: IDatabaseExistOptions<any>,
  ): Promise<boolean>;

  abstract create(data: Partial<Entity>, options?: IDatabaseCreateOptions<any>): Promise<EntityDoc>;

  abstract save(repository: EntityDoc, options?: IDatabaseSaveOptions): Promise<EntityDoc>;

  abstract delete(repository: EntityDoc, options?: IDatabaseSaveOptions): Promise<DeleteResult>;

  abstract softDelete(repository: EntityDoc, options?: IDatabaseSaveOptions): Promise<EntityDoc>;

  abstract restore(repository: EntityDoc, options?: IDatabaseSaveOptions): Promise<EntityDoc>;

  abstract createMany<Dto extends Record<string, any>>(
    data: Dto[],
    options?: IDatabaseCreateManyOptions<any>,
  ): Promise<boolean>;

  abstract deleteManyByIds(_id: string[], options?: IDatabaseManyOptions<any>): Promise<boolean>;

  abstract deleteMany(
    find: Record<string, any>,
    options?: IDatabaseManyOptions<any>,
  ): Promise<boolean>;

  abstract softDeleteManyByIds(
    _id: string[],
    options?: IDatabaseSoftDeleteManyOptions<any>,
  ): Promise<boolean>;

  abstract softDeleteMany(
    find: Record<string, any>,
    options?: IDatabaseSoftDeleteManyOptions<any>,
  ): Promise<boolean>;

  abstract restoreManyByIds(
    _id: string[],
    options?: IDatabaseRestoreManyOptions<any>,
  ): Promise<boolean>;

  abstract restoreMany(
    find: Record<string, any>,
    options?: IDatabaseRestoreManyOptions<any>,
  ): Promise<boolean>;

  abstract updateMany<Dto extends UpdateWithAggregationPipeline | UpdateQuery<unknown>>(
    find: Record<string, any>,
    data: Dto,
    options?: IDatabaseManyOptions<any>,
  ): Promise<boolean>;

  abstract updateManyRaw(
    find: Record<string, any>,
    data: UpdateWithAggregationPipeline | UpdateQuery<any>,
    options?: IDatabaseManyOptions<any>,
  ): Promise<boolean>;

  abstract updateOneAndReturn<Dto extends Partial<Entity>>(
    filter: Dto,
    data: Dto,
    options?: IDatabaseUpdateOneOptions<ClientSession>,
  ): Promise<Dto | boolean>;

  abstract raw<RawResponse, RawQuery = any>(
    rawOperation: RawQuery,
    options?: IDatabaseRawOptions,
  ): Promise<RawResponse[]>;

  abstract model(): Promise<any>;
}
