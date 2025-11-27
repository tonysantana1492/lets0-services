import type { IAddressInterface } from '@/common/google/maps/interfaces/google-maps.interface';
import type {
  IRetailerAddress,
  IRetailerContact,
} from '@/common/google/maps/interfaces/google-places.service.interface';

export const ADDRESS_AUTOCOMPLETE_META_KEY = 'AddressAutocompleteMetaKey';
export const ADDRESS_DETAILS_META_KEY = 'AddressDetailsMetaKey';

export const ADDRESS_DEFAULT: IAddressInterface = {
  one: '',
  two: '',
  city: '',
  state: '',
  zip: '',
  country: 'US',
  placeId: '',
};

export const RETAILER_ADDRESS_DEFAULT: IRetailerAddress = {
  address1: '',
  address2: '',
  city: '',
  state: '',
  zip: '',
  latitude: 0,
  longitude: 0,
  country: 'US',
  placeId: '',
};

export const RETAILER_CONTACT_DEFAULT: IRetailerContact = {
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
};
