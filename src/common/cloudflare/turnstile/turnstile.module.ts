import { HttpModule } from '@nestjs/axios';
import { DynamicModule, Global, Module, Provider } from '@nestjs/common';

import { TurnstileGuard } from './guards/turnstile.guard';
import { IAsyncTurnstileOptions, ITurnstileOptions } from './interfaces/turnstile.interface';
import { TurnstileService } from './services/turnstile.service';

const TurnstileServiceOptionsToken = 'TurnstileServiceOptions';

const providers: Provider[] = [TurnstileGuard, TurnstileService];

@Global()
@Module({})
export class TurnstileModule {
  public static forRoot(options: ITurnstileOptions): DynamicModule {
    const TurnstileModuleOptionsProvider: Provider = {
      provide: TurnstileServiceOptionsToken,
      useValue: options,
    };

    return {
      module: TurnstileModule,
      imports: [HttpModule],
      providers: [...providers, TurnstileModuleOptionsProvider],
      exports: [...providers, TurnstileModuleOptionsProvider],
    };
  }

  public static forRootAsync({
    imports,
    inject,
    useFactory,
  }: IAsyncTurnstileOptions): DynamicModule {
    const TurnstileModuleOptionsProvider: Provider = {
      provide: TurnstileServiceOptionsToken,
      inject: inject || [],
      useFactory,
    };

    return {
      module: TurnstileModule,
      imports: [...(imports || []), HttpModule],
      providers: [...providers, TurnstileModuleOptionsProvider],
      exports: [...providers, TurnstileModuleOptionsProvider],
    };
  }
}
