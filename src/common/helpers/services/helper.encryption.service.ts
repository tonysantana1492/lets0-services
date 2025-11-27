import { createHash } from 'crypto';
import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import baseX from 'base-x';
import CryptoJS from 'crypto-js';
import { v4 as uuidV4 } from 'uuid';

import { ITokenPayload } from '@/common/auth/interfaces/token-payload.interface';
import { ERROR_CODES } from '@/common/error/constants/error-code';
import { AppRequestException } from '@/common/error/exceptions/app-request.exception';

import {
  IHelperJwtOptions,
  IHelperJwtVerifyOptions,
  IJwt,
  IJwtResponse,
} from '../interfaces/helper.encryption-service.interface';

@Injectable()
export class HelperEncryptionService {
  // This Base62 string contains all digits and English alphabets (both cases)
  private readonly base62Characters =
    '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

  private readonly base62 = baseX(this.base62Characters);

  constructor(private readonly jwtService: JwtService) {}

  private readonly logger: Logger = new Logger(HelperEncryptionService.name);

  /**
   * Generates a unique string using Base62 encoding.
   *
   * @returns {string} A unique string encoded in Base62.
   */
  createUniqueStrings(): string {
    return this.base62.encode(Buffer.from(uuidV4() + new Date().toISOString()));
  }

  /**
   * Creates a secret string by computing the MD5 hash of the given salt.
   *
   * @param {string} salt - The salt value used to generate the secret.
   * @returns {string} The secret string computed by hashing the salt with MD5 algorithm.
   */
  createMD5secret(salt: string): string {
    return createHash('md5').update(salt).digest('hex').slice(0, 55);
  }

  /**
   * Encrypts data using AES256 algorithm.
   *
   * @param {T} data - The data to be encrypted.
   * @param {string} key - The secret key used for encryption.
   * @param {string} iv - The initialization vector used for encryption.
   * @returns {string} The encrypted data.
   *
   * @throws {Error} If an error occurs during encryption.
   */
  aes256Encrypt<T>(data: T, key: string, iv: string): string {
    let cipher = '';

    try {
      const cIv = CryptoJS.enc.Utf8.parse(iv);
      cipher = CryptoJS.AES.encrypt(JSON.stringify(data), key, {
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
        iv: cIv,
      }).toString();

      return cipher;
    } catch (error) {
      this.logger.error(error);
    }

    return cipher;
  }

  /**
   * Decrypts an AES-256 encrypted string using the given key and Initialization Vector (IV).
   *
   * @template T - The type of the expected decrypted value.
   *
   * @param {string} encrypted - The AES-256 encrypted string.
   * @param {string} key - The key used for encryption.
   * @param {string} iv - The Initialization Vector (IV) used for encryption.
   *
   * @return {T} - The decrypted value of type T.
   */
  aes256Decrypt<T>(encrypted: string, key: string, iv: string): T {
    const cIv = CryptoJS.enc.Utf8.parse(iv);
    const cipher = CryptoJS.AES.decrypt(encrypted, key, {
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
      iv: cIv,
    });

    return JSON.parse(cipher.toString(CryptoJS.enc.Utf8)) as T;
  }

  /**
   * Encrypts the payload using JSON Web Token (JWT).
   *
   * @param {Record<string, any>} payload - The payload to be encrypted.
   * @param {IHelperJwtOptions} options - The configuration options for encrypting the payload.
   * @return {string} - The encrypted JWT token.
   */
  jwtEncrypt(payload: Record<string, any>, options: IHelperJwtOptions): string {
    return this.jwtService.sign(payload, {
      secret: options.secretKey,
      expiresIn: options.expiredIn,
      notBefore: options.notBefore ?? 0,
      audience: options.audience,
      issuer: options.issuer,
      ...(options.subject ? { subject: options.subject } : {}),
    });
  }

  /**
   * Decrypts a JSON Web Token (JWT) and returns the decoded payload.
   *
   * @param {string} token - The JWT to decrypt.
   * @return {Record<string, any>} - The decoded payload of the JWT.
   */
  jwtDecrypt<T = Record<string, any>>(token: string): T {
    return this.jwtService.decode<T>(token);
  }

  /**
   * Verifies the given JSON Web Token (JWT) using the provided options.
   *
   * @param {string} token - The JWT to verify.
   * @param {IHelperJwtVerifyOptions} options - The options used for verification.
   * @returns {boolean} - true if the token is valid, false otherwise.
   */
  jwtVerify<T = ITokenPayload>(token: string, options: IHelperJwtVerifyOptions): IJwtResponse<T> {
    try {
      this.jwtService.verify(token, {
        secret: options.secretKey,
      });

      const payload = this.jwtDecrypt<IJwt<T>>(token);

      return { payload, isExpired: false, hasError: false };
    } catch (error) {
      // This will be handler by the logic that call this, to renew the token there
      if ((error as Error).name === 'TokenExpiredError') {
        const payload = this.jwtDecrypt<IJwt<T>>(token);

        return { payload, isExpired: true, hasError: false };
      }

      // The error is rethrow to handle the error in the correct way in the logic that call this
      throw new AppRequestException({
        ...ERROR_CODES.ACCESS_TOKEN_INTERNAL_ERROR,
        errors: [error],
      });
    }
  }
}
