/**
 * This interceptor is used to automatically transform Mongoose documents
 * (which have methods like toJSON) into instances of classes defined by you,
 * using the serialization capabilities of NestJS and class-transformer.
 * This allows you, for example, to apply decorators like @Expose or @Exclude
 * in your DTOs and ensure that the response sent to the client is properly formatted.
 *
 * @param classToIntercept - The class to be intercepted and transformed.
 * @returns An interceptor that extends ClassSerializerInterceptor.
 *
 * Example of use
 *
 * @Controller('users')
 * @UseInterceptors(MongooseClassSerializerInterceptor(UserDto))
 * export class UserController {
 *  constructor(private readonly userService: UserService) {}
 * }
 */
import type { PlainLiteralObject, Type } from '@nestjs/common';
import type { ClassTransformOptions } from 'class-transformer';
import { ClassSerializerInterceptor } from '@nestjs/common';

import { plainToClass } from 'class-transformer';
import { Document } from 'mongoose';

function MongooseClassSerializerInterceptor(
  classToIntercept: Type,
): typeof ClassSerializerInterceptor {
  return class Interceptor extends ClassSerializerInterceptor {
    private changePlainObjectToClass(document: PlainLiteralObject) {
      if (!(document instanceof Document)) {
        return document;
      }

      return plainToClass(classToIntercept, document.toJSON());
    }

    private prepareResponse(
      response: PlainLiteralObject | PlainLiteralObject[],
    ): PlainLiteralObject {
      if (!Array.isArray(response) && response?.results) {
        const results = this.prepareResponse(response?.results);
        return {
          ...response,
          results,
        };
      }

      if (Array.isArray(response)) {
        return response.map((item) => this.changePlainObjectToClass(item));
      }

      return this.changePlainObjectToClass(response);
    }

    serialize(response: PlainLiteralObject | PlainLiteralObject[], options: ClassTransformOptions) {
      return super.serialize(this.prepareResponse(response), options);
    }
  };
}

export default MongooseClassSerializerInterceptor;
