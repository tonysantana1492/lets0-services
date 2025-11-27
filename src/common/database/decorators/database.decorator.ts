import type { SchemaOptions } from '@nestjs/mongoose';
import { InjectConnection, InjectModel, Schema } from '@nestjs/mongoose';

import {
  DATABASE_CREATED_AT_FIELD_NAME,
  DATABASE_UPDATED_AT_FIELD_NAME,
  MAIN_DB_CONNECTION_NAME,
} from '@/common/database/constants/database.constant';

export function DatabaseConnection(connectionName?: string): ParameterDecorator {
  return InjectConnection(connectionName ?? MAIN_DB_CONNECTION_NAME);
}

export function DatabaseModel(entity: string, connectionName?: string): ParameterDecorator {
  return InjectModel(entity, connectionName ?? MAIN_DB_CONNECTION_NAME);
}

export function DatabaseEntity(options?: SchemaOptions): ClassDecorator {
  return Schema({
    ...options,
    toJSON: {
      virtuals: true,
      getters: true,
      versionKey: false,
      transform(doc, ret) {
        delete ret.__v;
        delete ret._id;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      getters: true,
      versionKey: false,
      transform(doc, ret) {
        delete ret.__v;
        delete ret._id;
        return ret;
      },
    },
    versionKey: false,
    timestamps: {
      createdAt: DATABASE_CREATED_AT_FIELD_NAME,
      updatedAt: DATABASE_UPDATED_AT_FIELD_NAME,
    },
  });
}
