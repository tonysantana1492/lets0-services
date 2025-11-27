import { Global, Module } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';

import { ClsPluginTransactional } from '@nestjs-cls/transactional';
import { ClsModule } from 'nestjs-cls';
import { v4 } from 'uuid';

import { TransactionalAdapterMongoose } from '@/common/context/adapters/transactional-mongoose.adapter';
import ContextService from '@/common/context/context.service';
import { MAIN_DB_CONNECTION_NAME } from '@/common/database/constants/database.constant';
import { DatabaseModule } from '@/common/database/database.module';

@Global()
@Module({
  imports: [
    ClsModule.forRoot({
      global: true,

      middleware: {
        mount: true,
        generateId: true,
        idGenerator: (req: Request) => req.headers['x-correlation-id'] ?? v4(),
      },

      plugins: [
        new ClsPluginTransactional({
          imports: [
            // module in which the Connection instance is provided
            DatabaseModule,
          ],
          adapter: new TransactionalAdapterMongoose({
            // the injection token of the mongoose Connection
            mongooseConnectionToken: getConnectionToken(MAIN_DB_CONNECTION_NAME),
          }),
        }),
      ],
    }),
  ],
  controllers: [],
  providers: [ContextService],
  exports: [ContextService],
})
export class ContextModule {}
