import type { IHelperHashService } from '@/common/helpers/interfaces/helper.hash-service.interface';
import { Injectable } from '@nestjs/common';

import { compareSync, genSaltSync, hashSync } from 'bcrypt';
import { enc, SHA256 } from 'crypto-js';

@Injectable()
export class HelperHashService implements IHelperHashService {
  /**
   * Generates a random salt with the provided length.
   * @param {number} length - The length of the salt to generate.
   * @return {string} A random salt string.
   */
  randomSalt(length: number): string {
    return genSaltSync(length);
  }

  /**
   * bcrypt method takes a password string and a salt string as parameters and returns the hashed password.
   *
   * @param {string} passwordString - The password string to be hashed.
   * @param {string} salt - The salt to be used for hashing.
   * @return {string} - The hashed password string.
   */
  bcrypt(passwordString: string, salt: string | number): string {
    return hashSync(passwordString, salt);
  }

  /**
   * Compares a plain password string with a hashed password using bcrypt algorithm.
   *
   * @param {string} passwordString - The plain password to be compared.
   * @param {string} passwordHashed - The hashed password to be compared against.
   *
   * @return {boolean} - Returns true if the plain password matches the hashed password, otherwise false.
   */
  bcryptCompare(passwordString: string, passwordHashed: string): boolean {
    return compareSync(passwordString, passwordHashed);
  }

  /**
   * Calculates the SHA256 hash value of the given string.
   *
   * @param {string} string - The input string to calculate the hash value for.
   * @return {string} - The SHA256 hash value of the string.
   */
  sha256(string: string): string {
    return SHA256(string).toString(enc.Hex);
  }

  /**
   * Compare two SHA256 hashes and check if they are equal.
   *
   * @param {string} hashOne - The first SHA256 hash to compare.
   * @param {string} hashTwo - The second SHA256 hash to compare.
   * @return {boolean} Returns `true` if the two hashes are equal, `false` otherwise.
   */
  sha256Compare(hashOne: string, hashTwo: string): boolean {
    return hashOne === hashTwo;
  }
}
