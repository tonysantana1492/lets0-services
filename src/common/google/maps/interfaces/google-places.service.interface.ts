import type { Types } from 'mongoose';

export interface IRetailerAddress {
  _id?: Types.ObjectId;

  address1?: string;

  address2?: string;

  city: string;

  state: string;

  zip: string;

  country?: string;

  latitude?: number;

  longitude?: number;

  placeId?: string;
}

export interface IRetailerContact {
  firstName: string;

  lastName: string;

  email: string;

  phone: string;
}

export interface IPlaceAutocompleteResults {
  id: string;

  description: string;
}

export interface IGooglePlacesServiceInterface {
  autocomplete(
    input: string,
    key: string,
    sessionToken: string,
  ): Promise<IPlaceAutocompleteResults[]>;

  placeDetails(place_id: string, sessionToken: string): Promise<IRetailerAddress | boolean>;
}
