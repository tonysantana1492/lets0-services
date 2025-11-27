import type { IHelperNumberService } from '@/common/helpers/interfaces/helper.number-service.interface';
import { Injectable } from '@nestjs/common';

import { faker } from '@faker-js/faker';

@Injectable()
export class HelperNumberService implements IHelperNumberService {
  /**
   * Checks if the given number is a valid integer.
   *
   * @param {string} number - The number to be checked.
   * @return {boolean} - Returns true if the number is a valid integer, otherwise false.
   */
  check(number: string): boolean {
    const regex = /^-?\d+$/;

    return regex.test(number);
  }

  /**
   * Parses a string and converts it into an integer.
   *
   * @param {string} str - The string to be parsed.
   * @returns {number} - The integer value of the parsed string.
   */
  createNumber = Number.parseInt;

  /**
   * Generates a random number with specified number of digits.
   *
   * @param {number} length - The number of digits in the random number.
   * @returns {number} - A random number with specified number of digits.
   */
  random(length: number): number {
    const min: number = Number.parseInt(`1`.padEnd(length, '0'), 10);
    const max: number = Number.parseInt(`9`.padEnd(length, '9'), 10);

    return this.randomInRange(min, max);
  }

  /**
   * Generate a random integer within a given range.
   *
   * @param {number} min - The minimum value of the range (inclusive).
   * @param {number} max - The maximum value of the range (inclusive).
   * @return {number} - A random integer within the specified range.
   */
  randomInRange(min: number, max: number): number {
    return faker.number.int({ min, max });
  }

  /**
   * Calculates the percentage of a value in relation to a total.
   *
   * @param {number} value - The value to calculate the percentage for.
   * @param {number} total - The total value to calculate the percentage against.
   * @return {number} - The percentage value.
   */
  percent(value: number, total: number): number {
    let tValue = value / total;

    if (Number.isNaN(tValue) || !Number.isFinite(tValue)) {
      tValue = 0;
    }

    return Number.parseFloat((tValue * 100).toFixed(2));
  }
}
