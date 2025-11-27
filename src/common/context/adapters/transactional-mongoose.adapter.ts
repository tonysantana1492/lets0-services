import type { TransactionalAdapter } from '@nestjs-cls/transactional';
import type { ClientSession, Connection } from 'mongoose';

type MongooseTransactionOptions = Parameters<Connection['transaction']>[1];

export interface IMongoDBTransactionalAdapterOptions {
  /**
   * The injection token for the mongoose Connection instance.
   */
  mongooseConnectionToken: any;

  /**
   * Default options for the transaction. These will be merged with any transaction-specific options
   * passed to the `@Transactional` decorator or the `TransactionHost#withTransaction` method.
   */
  defaultTxOptions?: Partial<MongooseTransactionOptions>;
}

export class TransactionalAdapterMongoose
  implements TransactionalAdapter<Connection, ClientSession | null, MongooseTransactionOptions>
{
  connectionToken: any;

  defaultTxOptions?: Partial<MongooseTransactionOptions>;

  constructor(options: IMongoDBTransactionalAdapterOptions) {
    this.connectionToken = options.mongooseConnectionToken;
    this.defaultTxOptions = options.defaultTxOptions;
  }

  supportsTransactionProxy = false;

  optionsFactory(connection: Connection) {
    return {
      wrapWithTransaction: async (
        options: MongooseTransactionOptions,
        fn: (...args: any[]) => Promise<any>,
        setTx: (tx?: ClientSession) => void,
      ) =>
        connection.transaction((session) => {
          setTx(session);
          return fn();
        }, options),

      getFallbackInstance: () => null,
    };
  }
}
