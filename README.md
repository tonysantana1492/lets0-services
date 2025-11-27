## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

No quitar el UserSchema.plugin(mongooseLeanVirtuals); ya que al hacer las operacione de base de datos con lean (find, update, etc) los valores que retorna son incluyen los virtuals, ni siquiera si usas @Vistual en las entidades

# 1

Can I use the CRUD to the model without try/catch its handle internal way, but if you
want handle in a custom way you can use try/catch and see what kind of error is throw

### Custom

public async createUser(userData: ICreateUser) {
try {
return await this.userModel.create(userData);
} catch (error) {
if (error?.responseCode === ERROR_CODES.DUPLICATE_KEY.responseCode) {
throw new AppRequestException({ ...ERROR_CODES.EMAIL_ALREADY_EXISTS, errors: [error] });
}

      throw new AppRequestException({ ...ERROR_CODES.DATABASE_ERROR, errors: [error] });
    }

}

### Normal

async updateOneAndReturn(id: string, data: Partial<UserEntity>) {
return this.userModel.updateOne({ \_id: new Types.ObjectId(id) }, data);
}
