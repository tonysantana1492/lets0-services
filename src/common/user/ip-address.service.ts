import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';

import { lastValueFrom } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable()
export class IpAddressService {
  private readonly logger = new Logger(IpAddressService.name);

  constructor(private readonly httpService: HttpService) {}

  public async getLocationByIp(
    ip: string,
  ): Promise<{ country: string; city: string; region: string; timezone: string }> {
    if (!ip) {
      return { country: 'Unknown', city: 'Unknown', region: 'Unknown', timezone: 'Unknown' };
    }

    try {
      const response = await lastValueFrom(
        this.httpService.get(`http://www.geoplugin.net/json.gp?ip=${encodeURIComponent(ip)}`).pipe(
          map((resp) => resp.data),
          catchError((err) => {
            throw err;
          }),
        ),
      );

      const country = response.geoplugin_countryName ?? 'Unknown'; // United States
      const city = response.geoplugin_city ?? 'Unknown'; // Hialeah
      const region = response.geoplugin_region ?? 'Unknown'; // "Florida",
      const timezone = response.geoplugin_timezone ?? 'Unknown'; // "America\/New_York",

      return { country, city, region, timezone };
    } catch {
      this.logger.warn(`Fail to get location from IP="${ip}", returning Unknown`);
      return { country: 'Unknown', city: 'Unknown', region: 'Unknown', timezone: 'Unknown' };
    }
  }
}
