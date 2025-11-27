import type { ENUM_PAGINATION_SORT_DIRECTION_TYPE } from '@/common/pagination/constants/pagination.enum.constant';
import type { PopulateOptions, ProjectionFields } from 'mongoose';

export type IPaginationSort = Record<string, ENUM_PAGINATION_SORT_DIRECTION_TYPE>;

export interface IPaginationPaging {
  limit: number;
  offset: number;
}

export interface IPaginationOptions {
  paging?: IPaginationPaging;
  sort?: IPaginationSort;
}

// find one
export interface IDatabaseFindOneOptions<T = any> extends Pick<IPaginationOptions, 'sort'> {
  skipTransaction?: boolean;
  select?: Record<string, boolean | number>;
  join?: boolean | PopulateOptions | Array<string | PopulateOptions>;
  session?: T;
  projection?: ProjectionFields<Record<string, any>>;
  lean?: boolean;
  withDeleted?: boolean;
}

export type IDatabaseGetTotalOptions<T = any> = Pick<
  IDatabaseFindOneOptions<T>,
  'session' | 'withDeleted' | 'join'
>;

export type IDatabaseSaveOptions<T = any> = Pick<
  IDatabaseFindOneOptions<T>,
  'session' | 'skipTransaction'
>;

// find
export interface IDatabaseFindAllOptions<T = any>
  extends IPaginationOptions,
    Omit<IDatabaseFindOneOptions<T>, 'sort'> {}

// create

export interface IDatabaseCreateOptions<T = any>
  extends Pick<IDatabaseFindOneOptions<T>, 'session' | 'skipTransaction'> {
  _id?: string;
}

// exist

export interface IDatabaseExistOptions<T = any>
  extends Pick<IDatabaseFindOneOptions<T>, 'session' | 'withDeleted' | 'join' | 'skipTransaction'> {
  excludeId?: string[];
}

// bulk
export type IDatabaseManyOptions<T = any> = Pick<
  IDatabaseFindOneOptions<T>,
  'session' | 'join' | 'skipTransaction'
>;

export type IDatabaseCreateManyOptions<T = any> = Pick<
  IDatabaseFindOneOptions<T>,
  'session' | 'skipTransaction'
>;

export type IDatabaseSoftDeleteManyOptions<T = any> = IDatabaseManyOptions<T>;

export interface IDatabaseUpdateManyOptions extends IDatabaseManyOptions {
  upsert?: boolean;
}

export type IDatabaseRestoreManyOptions<T = any> = IDatabaseManyOptions<T>;

export type IDatabaseRawOptions<T = any> = Pick<
  IDatabaseFindOneOptions<T>,
  'session' | 'withDeleted' | 'skipTransaction'
>;

export interface IDatabaseUpdateOptions<T = any> {
  skipTransaction?: boolean;
  session?: T;
  join?: boolean | PopulateOptions | Array<string | PopulateOptions>;
  upsert?: boolean;
  returnDocument?: 'before' | 'after';
  // new?: boolean;
}

export type IDatabaseUpdateOneOptions<T = any> = IDatabaseUpdateOptions<T>;
export type IDatabaseFindOneAndUpdateOptions<T = any> = IDatabaseUpdateOptions<T>;

// Paths<User> => 'mfa' | 'mfa.secret' | 'mfa.isEnabled'
export type Paths<T> = T extends object
  ? {
      [K in keyof T & string]-?: K | (T[K] extends object ? `${K}.${Paths<T[K]>}` : never);
    }[keyof T & string]
  : never;

// Extract the  key value
// type X = Get<User, 'mfa.secret'>; // string
export type Get<T, P extends string> = P extends keyof T
  ? T[P]
  : P extends `${infer K}.${infer Rest}`
    ? K extends keyof T
      ? Get<T[K], Rest>
      : never
    : never;
