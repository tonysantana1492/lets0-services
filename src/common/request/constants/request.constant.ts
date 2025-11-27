import type { ApiPropertyOptions } from '@nestjs/swagger';

import { STATES_CODE, STATES_SHORT_NAME } from '@/common/app-config/enums/states.enum';

export const REQUEST_PARAM_CLASS_DTOS_META_KEY = 'RequestParamClassDtosMetaKey';

export const REQUEST_CLOUD_LOC_CLASS_DTOS_META_KEY = 'RequestCloudLocClassDtosMetaKey';
export const REQUEST_CUSTOM_TIMEOUT_META_KEY = 'RequestCustomTimeoutMetaKey';
export const REQUEST_CUSTOM_TIMEOUT_VALUE_META_KEY = 'RequestCustomTimeoutValueMetaKey';
export const REQUEST_CLOUD_API_KEY = 'X-Lets0-Api-Key';
export const REQUEST_API_ENV = 'X-Lets0-Api-Env';

export const REQUEST_PROTECTED_KEY = 'X-Lets0-Protected';
export const REQUEST_PROTECTED_TIMESTAMP = 'X-Lets0-Timestamp';
export const EXPOSED_HEADERS = 'Set-Cookie, X-Lets0-Protected, X-Lets0-Timestamp, X-Lets0-Session';

export const REQUEST_CLOUD_PROTECTED_SESSION = 'X-Lets0-Session';

export const LOC_DESC =
  'The loc parameter provides 2 different options for location based information' +
  'through the following parameters, at least 1 is required:' +
  '*longitude and latitude are prioritized if included in the request*';

export const ADDRESS_DESC =
  'Location information split out to individual' +
  'values for the street, city, state, zip code and country. If you choose to' +
  'use this option for your location, only the state is required.';

export const COORDS_DESC =
  'Location information provided through an' +
  'exact geospatial point by providing valid longitude and latitude coordinates values.';

export const STATE_MIXED_VALUES: string[] = [
  ...Object.values(STATES_CODE),
  ...Object.values(STATES_SHORT_NAME),
];

export const LOC_API_PROP: ApiPropertyOptions = {
  description: LOC_DESC,
  required: false,
  nullable: true,
  default: {},
  example: {
    address: {},
    coords: {},
  },
};

export const LOC_ADDRESS_API_PROP: ApiPropertyOptions = {
  name: 'address',
  description: ADDRESS_DESC,
  example: {
    one: '100 Madison ave',
    two: '',
    city: 'New York',
    state: 'NY',
    zip: '10016',
  },
  required: false,
  nullable: true,
  default: {},
};

export const LOC_COORDS_API_PROP: ApiPropertyOptions = {
  name: 'coords',
  description: COORDS_DESC,
  example: {
    lat: 0,
    long: 0,
  },
  required: false,
  nullable: true,
  default: {},
};
