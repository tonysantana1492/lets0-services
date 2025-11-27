import type {
  IGooglePlacesServiceInterface,
  IPlaceAutocompleteResults,
  IRetailerAddress,
} from '@/common/google/maps/interfaces/google-places.service.interface';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { Client, PlaceAutocompleteType } from '@googlemaps/google-maps-services-js';

import { RETAILER_ADDRESS_DEFAULT } from '@/common/app-config/constants/address.constant';
import { IGoogleConfigInterface } from '@/common/app-config/interfaces/google.config.interface';

@Injectable()
export class GooglePlacesService implements IGooglePlacesServiceInterface {
  private logger = new Logger(GooglePlacesService.name);

  private readonly placesApiKey: string;

  private readonly addressParseRegex =
    /^(\w\d+(?:-\w+)?)\s+(.+?)\s*,\s*([^,]+)(?:\s*,\s*([a-z]{2}))?\s*(\d{5}(?:-\d{4})?)?(?:\s*,?\s*(.*))?$/i;

  private readonly mapsClient: Client;

  constructor(private readonly configService: ConfigService) {
    this.placesApiKey = (this.configService.get('google') as IGoogleConfigInterface).places.apiKey;

    this.mapsClient = new Client();
  }

  async autocomplete(input: string, sessionToken: string): Promise<IPlaceAutocompleteResults[]> {
    let places: IPlaceAutocompleteResults[] = [];

    try {
      const { data } = await this.mapsClient.placeAutocomplete({
        params: {
          key: this.placesApiKey,
          input,
          types: PlaceAutocompleteType.address,
          sessiontoken: sessionToken,
        },
      });

      const predictions = data.predictions || [];

      if (predictions.length > 0) {
        places.push(
          ...predictions.map(({ description, place_id }) => ({ id: place_id, description })),
        );
      }
    } catch (error) {
      places = [];

      if (error.response.status === 403) {
        throw new BadRequestException({
          statusCode: 403,
          message: 'The provided Google Maps API key is invalid.',
        });
      }
    }

    return places;
  }

  private parseAddress(address: string): IRetailerAddress {
    const match = new RegExp(this.addressParseRegex).exec(address);

    if (!match) {
      return RETAILER_ADDRESS_DEFAULT;
    }

    // eslint-disable-next-line prefer-const
    let [, streetNumber, street, city, state, zipCode, country] = match;

    if (!state) {
      state = '';
    }

    if (!zipCode) {
      zipCode = '';
    }

    country = 'US';

    return {
      address1: `${streetNumber} ${street}`,
      address2: '',
      city,
      state,
      zip: zipCode,
      country,
    };
  }

  async placeDetails(placeId: string, sessionToken: string): Promise<IRetailerAddress | boolean> {
    let address: IRetailerAddress | boolean = false;

    try {
      const { data } = await this.mapsClient.placeDetails({
        params: {
          key: this.placesApiKey,
          place_id: placeId,
          sessiontoken: sessionToken,
        },
      });

      const result = data.result || {};

      if (
        Object.entries(result).length > 0 &&
        result.geometry?.location?.lat &&
        result.geometry.location.lng
      ) {
        const googleAddress = result.formatted_address
          ? this.parseAddress(result.formatted_address)
          : RETAILER_ADDRESS_DEFAULT;
        address = {
          ...googleAddress,
          latitude: result.geometry.location.lat,
          longitude: result.geometry.location.lng,
          placeId,
        };
      }
    } catch (error) {
      address = false;

      if (error.response.status === 403) {
        throw new BadRequestException({
          statusCode: 403,
          message: 'The provided Google Maps API key is invalid.',
        });
      }
    }

    return address;
  }
}
