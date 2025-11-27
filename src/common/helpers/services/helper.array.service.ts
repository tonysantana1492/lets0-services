import type { IHelperArrayService } from '@/common/helpers/interfaces/helper.array-service.interface';
import { Injectable } from '@nestjs/common';

import _ from 'lodash';

@Injectable()
export class HelperArrayService implements IHelperArrayService {
  /**
   * Calculates all possible combinations from a nested list.
   *
   * @template T - The type of elements in the list.
   * @param {T[][]} list - The nested list from which to calculate combinations.
   * @param {number} [start=0] - The index to start calculating combinations from.
   * @param {T[][]} [result=[]] - The result array to store the combinations.
   * @param {T[]} [current=[]] - The current combination being calculated.
   * @returns {T[][]} - The array of all possible combinations.
   */
  getCombinations<T>(list: T[][], start = 0, result: T[][] = [], current: T[] = []): T[][] {
    if (start === list.length) {
      result.push(current);
    } else {
      for (const item of list[start]) {
        this.getCombinations(list, start + 1, result, [...current, item]);
      }
    }

    return result;
  }

  /**
   * Returns the last element of the given array.
   *
   * @param {Array} array - The array to retrieve the last element from.
   * @returns {*} The last element of the array.
   */
  getLast<T>(array: T[]): T {
    if (array.length === 0) {
      throw new Error('Array is empty');
    }

    return array.at(-1) as T;
  }

  /**
   * Converts a dictionary or numeric dictionary into an array of values.
   *
   * @param {_.Dictionary<T> | _.NumericDictionary<T> | null | undefined} value - The dictionary or numeric dictionary to convert.
   * @return {T[]} - The resulting array of values from the dictionary or numeric dictionary.
   */
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  toArray<T>(value: _.Dictionary<T> | _.NumericDictionary<T>): T[] {
    return _.toArray(value);
  }

  /**
   * Returns the first element of an array.
   *
   * @template T
   * @param {T[]} array - The array from which to retrieve the first element.
   * @return {T} - The first element of the array.
   */
  getFirst<T>(array: T[]): T {
    return _.first(array);
  }

  /**
   * Retrieves the element at the specified index from the given array.
   *
   * @template T
   * @param {T[]} array - The array from which to retrieve the element.
   * @param {number} index - The index of the element to retrieve.
   * @return {T} The element at the specified index.
   */
  getFirstByIndex<T>(array: T[], index: number): T {
    return _.nth(array, index);
  }

  /**
   * Retrieves the element in an array by its index counting from the end.
   * If the index is positive, the method starts counting from the end of the array.
   * If the index is negative, the method starts counting from the beginning of the array.
   *
   * @param {T[]} array - The array from which to retrieve the element.
   * @param {number} index - The index of the element to retrieve.
   * @returns {T} - The element in the array based on the given index.
   */
  getLastByIndex<T>(array: T[], index: number): T {
    return _.nth(array, -Math.abs(index));
  }

  /**
   * Returns the first N elements from the given array.
   *
   * @param {Array} array - The array to take elements from.
   * @param {Number} length - The number of elements to take from the array.
   *
   * @return {Array} - An array containing the first N elements from the given array.
   */
  takeFirst<T>(array: T[], length: number): T[] {
    return _.take(array, length);
  }

  /**
   * Returns the last `length` elements of the given array.
   *
   * @param {T[]} array - The array from which to extract the last elements.
   * @param {number} length - The number of elements to extract from the end of the array.
   * @return {T[]} - An array containing the last `length` elements of the given array.
   */
  takeLast<T>(array: T[], length: number): T[] {
    return _.takeRight(array, length);
  }

  /**
   * Finds the index of the first occurrence of a given value in an array.
   *
   * @template T - The type of elements in the array.
   * @param {T[]} array - The array to search in.
   * @param {T} value - The value to search for.
   * @returns {number} - The index of the first occurrence of the value in the array, -1 if not found.
   */
  indexOf<T>(array: T[], value: T): number {
    return _.indexOf(array, value);
  }

  /**
   * Finds the last index of a specified value in an array.
   *
   * @param {T[]} array - The array to search in.
   * @param {T} value - The value to search for.
   * @returns {number} - The index of the last occurrence of the value in the array, or -1 if not found.
   */
  lastIndexOf<T>(array: T[], value: T): number {
    return _.lastIndexOf(array, value);
  }

  /**
   * Removes all occurrences of a specific value from an array.
   *
   * @template T - The type of array elements.
   * @param {T[]} array - The array from which to remove the value.
   * @param {T} value - The value to remove from the array.
   * @returns {T[]} - The array with the specified value removed.
   */
  remove<T>(array: T[], value: T): T[] {
    return _.remove(array, function (n) {
      return n === value;
    });
  }

  /**
   * Removes elements from the left side of an array.
   *
   * @template T - The type of elements in the array.
   * @param {T[]} array - The array to remove elements from.
   * @param {number} length - The number of elements to remove.
   * @returns {T[]} - A new array with the elements removed from the left side.
   */
  removeFromLeft<T>(array: T[], length: number): T[] {
    return _.drop(array, length);
  }

  /**
   * Removes the specified number of elements from the right side of the given array.
   *
   * @template T - The type of elements in the array.
   * @param {T[]} array - The array from which the elements will be removed.
   * @param {number} length - The number of elements to remove from the right side.
   * @returns {T[]} - The modified array with elements removed from the right side.
   */
  removeFromRight<T>(array: T[], length: number): T[] {
    return _.dropRight(array, length);
  }

  /**
   * Joins the elements of an array into a string with the specified delimiter.
   *
   * @param {T[]} array - The array of elements to join.
   * @param {string} delimiter - The string to use as a delimiter.
   * @returns {string} - The resulting string after joining the elements of the array.
   */
  join<T>(array: T[], delimiter: string): string {
    return _.join(array, delimiter);
  }

  /**
   * Splits a string into an array of substrings based on a specified delimiter.
   *
   * @param {string} _string - The input string to be split.
   * @param {string} delimiter - The delimiter used to determine where the string should be split.
   * @returns {string[]} - An array of substrings obtained by splitting the input string using the delimiter.
   */
  split(_string: string, delimiter: string): string[] {
    return _.split(_string, delimiter);
  }

  /**
   * Reverses the elements of an array.
   *
   * @template T
   * @param {T[]} array - The array to be reversed.
   * @returns {T[]} - The reversed array.
   */
  reverse<T>(array: T[]): T[] {
    return _.reverse(array);
  }

  /**
   * Returns an array with unique elements from the given array.
   *
   * @template T
   * @param {T[]} array - The array from which to get unique elements.
   * @return {T[]} - An array with unique elements from the given array.
   */
  unique<T>(array: T[]): T[] {
    return _.uniq(array);
  }

  /**
   * Shuffles the elements of an array using the Fisher-Yates algorithm.
   *
   * @param {T[]} array - The array to be shuffled.
   * @returns {T[]} - A new shuffled array.
   */
  shuffle<T>(array: T[]): T[] {
    return _.shuffle(array);
  }

  /**
   * Merges two arrays into a single array.
   *
   * @param {Array} a - The first array to be merged.
   * @param {Array} b - The second array to be merged.
   * @returns {Array} - A new array containing all elements from both input arrays.
   */
  merge<T>(a: T[], b: T[]): T[] {
    return [...a, ...b];
  }

  /**
   * Merges two arrays removing any duplicate values and returns the resulting array.
   *
   * @param {T[]} a - The first array to merge.
   * @param {T[]} b - The second array to merge.
   * @returns {T[]} - The merged array with unique values.
   */
  mergeUnique<T>(a: T[], b: T[]): T[] {
    return _.union(a, b);
  }

  /**
   * Checks if two arrays are equal.
   *
   * @param {Array<T>} a - The first array to compare.
   * @param {Array<T>} b - The second array to compare.
   * @returns {boolean} - True if the two arrays are equal, false otherwise.
   */
  equals<T>(a: T[], b: T[]): boolean {
    return _.isEqual(a, b);
  }

  /**
   * Checks if two arrays are not equal.
   *
   * @param {T[]} a - The first array to compare.
   * @param {T[]} b - The second array to compare.
   * @template T
   * @returns {boolean} - True if the arrays are not equal, false otherwise.
   */
  notEquals<T>(a: T[], b: T[]): boolean {
    return !_.isEqual(a, b);
  }

  /**
   * Checks if there is any intersection between two arrays.
   *
   * @param {Array} a - The first array.
   * @param {Array} b - The second array.
   * @returns {boolean} - True if there is any intersection, false otherwise.
   */
  in<T>(a: T[], b: T[]): boolean {
    return _.intersection(a, b).length > 0;
  }

  /**
   * Checks if array `a` has no elements in common with array `b`.
   *
   * @template T
   * @param {T[]} a - The first array to compare.
   * @param {T[]} [b] - The second array to compare. Defaults to an empty array if not provided.
   * @returns {boolean} Returns `true` if there are no common elements, otherwise `false`.
   */
  notIn<T>(a: T[], b?: T[]): boolean {
    return _.intersection(a, b).length === 0;
  }

  /**
   * Returns an array containing the intersection of two arrays.
   *
   * @param {T[]} a - The first array.
   * @param {T[]} b - The second array.
   * @template T
   * @returns {T[]} - An array containing the common elements from both arrays.
   */
  intersection<T>(a: T[], b: T[]): T[] {
    return _.intersection(a, b);
  }

  /**
   * Calculates the difference between two arrays.
   *
   * @template T - The type of elements in the arrays.
   * @param {T[]} a - The first array.
   * @param {T[]} b - The second array.
   * @returns {T[]} - The array of elements from the first array that are not present in the second array.
   */
  difference<T>(a: T[], b: T[]): T[] {
    return _.difference(a, b);
  }

  /**
   * Checks if an element is included in an array.
   *
   * @param {Array} a - The array to be checked.
   * @param {any} b - The element to search for.
   * @returns {boolean} - True if the element is present in the array, false otherwise.
   */
  includes<T>(a: T[], b: T): boolean {
    return _.includes(a, b);
  }

  /**
   * Splits an array into smaller arrays of a specified size.
   *
   * @template T - The type of elements in the array.
   * @param {T[]} a - The array to be split.
   * @param {number} size - The size of each smaller array.
   * @return {T[][]} - An array of smaller arrays.
   */
  chunk<T>(a: T[], size: number): T[][] {
    return _.chunk<T>(a, size);
  }
}
