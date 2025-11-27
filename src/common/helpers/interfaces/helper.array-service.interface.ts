import type _ from 'lodash';

export interface IHelperArrayService {
  getCombinations<T>(list: T[][], start: number, result: T[][], current: T[]): T[][];

  getLast<T>(array: T[]): T;

  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  toArray<T>(value: _.Dictionary<T> | _.NumericDictionary<T> | null | undefined): T[];

  getFirst<T>(array: T[]): T;

  getFirstByIndex<T>(array: T[], index: number): T;

  getLastByIndex<T>(array: T[], index: number): T;

  takeFirst<T>(array: T[], length: number): T[];

  takeLast<T>(array: T[], length: number): T[];

  indexOf<T>(array: T[], value: T): number;

  lastIndexOf<T>(array: T[], value: T): number;

  remove<T>(array: T[], value: T): T[];

  removeFromLeft<T>(array: T[], length: number): T[];

  removeFromRight<T>(array: T[], length: number): T[];

  join<T>(array: T[], delimiter: string): string;

  split(string_: string, delimiter: string): string[];

  reverse<T>(array: T[]): T[];

  unique<T>(array: T[]): T[];

  shuffle<T>(array: T[]): T[];

  merge<T>(a: T[], b: T[]): T[];

  mergeUnique<T>(a: T[], b: T[]): T[];

  equals<T>(a: T[], b: T[]): boolean;

  notEquals<T>(a: T[], b: T[]): boolean;

  in<T>(a: T[], b: T[]): boolean;

  notIn<T>(a: T[], b: T[]): boolean;

  intersection<T>(a: T[], b: T[]): T[];

  difference<T>(a: T[], b: T[]): T[];

  includes<T>(a: T[], b: T): boolean;

  chunk<T>(a: T[], size: number): T[][];
}
