import type { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import type { Observable } from 'rxjs';
import type { IResult } from 'ua-parser-js';
import { Injectable } from '@nestjs/common';

import { AppConfigService } from '@/common/app-config/app-config.service';
import { ERROR_CODES } from '@/common/error/constants/error-code';
import { AppRequestException } from '@/common/error/exceptions/app-request.exception';
import { IRequestDefault } from '@/common/request/interfaces/request.interface';

@Injectable()
export class RequestUserAgentInterceptor implements NestInterceptor {
  private readonly userAgentOs: string[];

  private readonly userAgentBrowser: string[];

  constructor(private readonly appConfigService: AppConfigService) {
    this.userAgentBrowser = this.appConfigService.requestConfig.userAgent.browser;
    this.userAgentOs = this.appConfigService.requestConfig.userAgent.os;
  }

  /**
   * Intercept the request and validate the user agent.
   *
   * @param context The execution context.
   * @param next The next call handler.
   * @returns An observable of the intercepted request.
   * @throws ForbiddenException if the user agent OS or browser is invalid.
   */
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (context.getType() === 'http') {
      const request: IRequestDefault = context.switchToHttp().getRequest<IRequestDefault>();
      const userAgent: IResult = request.__userAgent;

      if (!this.isValidUserAgentOs(userAgent.os.name)) {
        throw new AppRequestException(ERROR_CODES.USER_AGENT_OS_INVALID);
      }

      if (!this.isValidUserAgentBrowser(userAgent.browser.name)) {
        throw new AppRequestException(ERROR_CODES.USER_AGENT_BROWSER_INVALID);
      }
    }

    return next.handle();
  }

  /**
   * Check if the user agent OS is valid.
   *
   * @param osName The name of the user agent OS.
   * @returns True if the user agent OS is valid, false otherwise.
   */
  private isValidUserAgentOs(osName: string | undefined): boolean {
    return this.userAgentOs.some((value) => new RegExp(new RegExp(osName ?? '')).exec(value));
  }

  /**
   * Check if the user agent browser is valid.
   *
   * @param browserName The name of the user agent browser.
   * @returns True if the user agent browser is valid, false otherwise.
   */
  private isValidUserAgentBrowser(browserName: string | undefined): boolean {
    return this.userAgentBrowser.some((value) =>
      new RegExp(new RegExp(browserName ?? '')).exec(value),
    );
  }
}
