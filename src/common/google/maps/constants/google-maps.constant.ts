import type { IGoogleMapsValidateInterface } from '@/common/google/maps/interfaces/google-maps.interface';

export const MAPS_VALIDATE_DEFAULT: IGoogleMapsValidateInterface = {
  coords: {
    lat: 0,
    long: 0,
  },
  address: {
    one: '',
    two: '',
    city: '',
    state: '',
    zip: '',
    country: 'US',
  },
  state: '',
  isStateOnly: false,
};
