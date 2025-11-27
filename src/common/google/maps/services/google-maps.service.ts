import type {
  IAddressInterface,
  ICoordsInterface,
  IGoogleMapsValidateInterface,
} from '@/common/google/maps/interfaces/google-maps.interface';
import type { IGoogleMapsServiceInterface } from '@/common/google/maps/interfaces/google-maps.service.interface';
import { Injectable, Logger, Scope } from '@nestjs/common';

import { Client } from '@googlemaps/google-maps-services-js';
import { omit } from 'lodash';

import { STATES_CODE, STATES_NAME } from '@/common/app-config/enums/states.enum';
import { MAPS_VALIDATE_DEFAULT } from '@/common/google/maps/constants/google-maps.constant';

type IValidateState = STATES_CODE | STATES_NAME | string;

@Injectable({ scope: Scope.REQUEST })
export class GoogleMapsService implements IGoogleMapsServiceInterface {
  private readonly logger: Logger;

  private readonly mapsClient: Client;

  constructor() {
    this.logger = new Logger(GoogleMapsService.name);

    this.mapsClient = new Client({});
  }

  async reverseGeocode({ lat, long }: ICoordsInterface): Promise<IAddressInterface> {
    const addressSet: IAddressInterface = {
      one: '',
      two: '',
      city: '',
      state: '',
      zip: '',
      country: 'US',
    };

    try {
      const { data } = await this.mapsClient.reverseGeocode({
        params: {
          latlng: { lat: Number(lat), lng: Number(long) },
          key: 'AIzaSyCNzJQxfaT814CffZc64bcTEzQnALWL574',
        },
        timeout: 8000, // milliseconds
      });

      if (data && data.results.length > 0) {
        const [street, city, stateAndZip] = data.results[0].formatted_address
          .split(',')
          .map((part) => part.trim());

        // Split state and zip
        const [state, zip] = stateAndZip.split(' ').map((part) => part.trim());

        addressSet.one = street ?? '';
        addressSet.city = city ?? '';
        addressSet.state =
          state.length === 2 && state !== 'US' && isNaN?.(Number?.(state)) ? state : '';
        addressSet.zip = isNaN?.(Number?.(zip)) ? '' : zip;
      }

      this.logger.debug(`Message ${JSON.stringify(addressSet)} published.`);
    } catch (error) {
      this.logger.error(`Received error while publishing: ${error.message}`, error.stack);
    }

    return addressSet;
  }

  async geocode(address: string): Promise<ICoordsInterface | boolean> {
    try {
      const { data } = await this.mapsClient.geocode({
        params: {
          address,
          key: 'AIzaSyCNzJQxfaT814CffZc64bcTEzQnALWL574',
        },
        timeout: 8000, // milliseconds
      });

      if (data && data.results.length > 0) {
        const coordinates = this.getCoordinatesIfValid(data.results[0]); // Get coordinates from the first result

        if (coordinates !== null) {
          return coordinates;
        }
      }

      this.logger.error(`No coordinates received.`);
    } catch (error) {
      this.logger.error(
        `Received error while fetch lat & long with maps geocode: ${error.message}`,
        error.stack,
      );
    }

    return false;
  }

  private getCoordinatesIfValid(result: any): ICoordsInterface | null {
    if (result.geometry?.location?.lat && result.geometry.location.lng) {
      return {
        lat: result.geometry.location.lat,
        long: result.geometry.location.lng,
      };
    }

    return null;
  }

  async validateAddressObj(val: IAddressInterface): Promise<IGoogleMapsValidateInterface> {
    const info: IGoogleMapsValidateInterface = MAPS_VALIDATE_DEFAULT;
    const addressObjWithoutApt = omit(val, 'two');

    const hasAtLeastFourNonEmptyFields =
      Object.values(addressObjWithoutApt).filter((value) => value !== '').length >= 4;

    if (hasAtLeastFourNonEmptyFields) {
      await this.populateInfo(info, val);
    } else {
      this.trySetStateInfo(info, val);
    }

    return info;
  }

  async populateInfo(info: IGoogleMapsValidateInterface, val: IAddressInterface) {
    const addressObjWithoutApt = omit(val, 'two');

    for (const [key, value] of Object.entries(addressObjWithoutApt)) {
      if (value !== '') {
        info.address[key as keyof IAddressInterface] = value as string;
      }
    }

    const coordsUpdated = await this.geocode(Object.values(omit(info.address, 'two')).join(', '));

    if (coordsUpdated) {
      info.coords = coordsUpdated;
      info.address.two = val.two;
      info.isStateOnly = false;
    } else {
      info.address = MAPS_VALIDATE_DEFAULT.address;
    }

    this.trySetStateInfo(info, val);
  }

  trySetStateInfo(info: IGoogleMapsValidateInterface, val: IAddressInterface) {
    if (val?.state && val.state !== '') {
      info.state = this.validateState(val.state);
      info.isStateOnly = !info.coords;
    }
  }

  validateState(val: IValidateState): STATES_CODE | STATES_NAME | string {
    let state: STATES_CODE | STATES_NAME | string = '';

    if (val in STATES_CODE) {
      state = STATES_CODE[val.toUpperCase()];
    }

    if (val in STATES_NAME) {
      state = STATES_NAME[val.toUpperCase()];
    }

    return state;
  }
}
